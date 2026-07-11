import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Tesseract from 'tesseract.js';
import { Grower } from '../entities/grower.entity';
import { LabTest } from '../entities/lab-test.entity';
import { PesticideLog } from '../entities/pesticide-log.entity';

@Injectable()
export class GrowerService {
  private readonly logger = new Logger(GrowerService.name);
  private readonly s3: S3Client;
  private readonly s3Bucket: string;

  constructor(
    @InjectRepository(Grower)
    private readonly growersRepo: Repository<Grower>,

    @InjectRepository(LabTest)
    private readonly labTestsRepo: Repository<LabTest>,

    @InjectRepository(PesticideLog)
    private readonly pesticideLogsRepo: Repository<PesticideLog>,

    private readonly config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: config.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.s3Bucket = config.get<string>('S3_BUCKET', 'cannaroute-growers');
  }

  // ─── Grower profile ───────────────────────────────────────────────────────

  async create(userId: string, dto: Partial<Grower>): Promise<Grower> {
    const grower = this.growersRepo.create({
      ...dto,
      user_id: userId,
      verification_status: 'pending',
    });
    const saved = await this.growersRepo.save(grower);

    // Auto-trigger license verification
    this.verifyLicenseAsync(saved.id).catch((err) =>
      this.logger.error(`License verify failed for grower ${saved.id}`, err),
    );

    return saved;
  }

  async findById(id: string): Promise<Grower> {
    const grower = await this.growersRepo.findOne({ where: { id } });
    if (!grower) throw new NotFoundException(`Grower ${id} not found`);
    return grower;
  }

  async findByUserId(userId: string): Promise<Grower> {
    const grower = await this.growersRepo.findOne({ where: { user_id: userId } });
    if (!grower) throw new NotFoundException(`No grower profile found for user ${userId}`);
    return grower;
  }

  /**
   * Returns the grower's profile mapped to camelCase for the frontend.
   * If no profile exists (e.g. demo account, new grower), returns a safe stub
   * so the portal doesn't 404.
   */
  async getMyProfile(userId: string): Promise<Record<string, unknown>> {
    const grower = await this.growersRepo.findOne({ where: { user_id: userId } });
    if (!grower) {
      return {
        id: null,
        farmName: 'Your Farm',
        farmDescription: null,
        licenseNumber: 'DEMO-0001',
        licenseExpiryDate: null,
        stateCode: 'MI',
        city: 'Detroit',
        county: null,
        cleanGreenCertified: false,
        cleanGreenCertNumber: null,
        sunEarthCertified: false,
        sunEarthCertNumber: null,
        usdaOrganic: false,
        noPesticidesUsed: true,
        outdoorGrown: false,
        indoorGrown: true,
        greenhouseGrown: false,
      };
    }
    return {
      id: grower.id,
      farmName: grower.farm_name,
      farmDescription: grower.farm_description,
      licenseNumber: grower.license_number,
      licenseExpiryDate: grower.license_expiry_date,
      stateCode: grower.state_code,
      city: grower.city,
      county: grower.county,
      cleanGreenCertified: grower.clean_green_certified,
      cleanGreenCertNumber: grower.clean_green_cert_number,
      sunEarthCertified: grower.sun_earth_certified,
      sunEarthCertNumber: grower.sun_earth_cert_number,
      usdaOrganic: grower.usda_organic,
      noPesticidesUsed: grower.no_pesticides_used,
      outdoorGrown: grower.outdoor_grown,
      indoorGrown: grower.indoor_grown,
      greenhouseGrown: grower.greenhouse_grown,
    };
  }

  /**
   * Returns lab tests for the authenticated grower mapped to camelCase.
   * Returns [] if no grower profile exists.
   */
  async getMyLabTests(userId: string): Promise<Record<string, unknown>[]> {
    const grower = await this.growersRepo.findOne({ where: { user_id: userId } });
    if (!grower) return [];

    const labTests = await this.labTestsRepo.find({
      where: { grower_id: grower.id },
      order: { created_at: 'DESC' },
    });

    return labTests.map((test) => ({
      id: test.id,
      productId: test.product_id,
      productName: 'Lab Sample', // product name requires join with inventory service
      labName: test.lab_name,
      labLicenseNumber: test.lab_license_number,
      thcPercentage: test.thc_percentage !== null ? Number(test.thc_percentage) : undefined,
      thcaPercentage: test.thca_percentage !== null ? Number(test.thca_percentage) : undefined,
      cbdPercentage: test.cbd_percentage !== null ? Number(test.cbd_percentage) : undefined,
      overallPass: test.overall_pass,
      coaUrl: null, // presigned S3 URL generated on demand in production
      testedAt: test.tested_at,
      createdAt: test.created_at,
    }));
  }

  /**
   * Returns compliance status for the authenticated grower.
   * Returns safe "compliant" defaults if no grower profile exists.
   */
  async getMyCompliance(userId: string): Promise<Record<string, unknown>> {
    const grower = await this.growersRepo.findOne({ where: { user_id: userId } });
    if (!grower) {
      return {
        licenseValid: true,
        licenseExpiresIn: 90,
        pendingCoaCount: 0,
        failedLabTests: 0,
        overallStatus: 'compliant',
      };
    }

    const labTests = await this.labTestsRepo.find({ where: { grower_id: grower.id } });
    const pendingCoaCount = labTests.filter(
      (t) => t.status === 'pending_parse' || t.status === 'parsed',
    ).length;
    const failedLabTests = labTests.filter((t) => !t.overall_pass && t.status === 'confirmed').length;

    let licenseExpiresIn: number | undefined;
    let licenseValid = true;
    if (grower.license_expiry_date) {
      const expiry = new Date(grower.license_expiry_date);
      const today = new Date();
      licenseExpiresIn = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      licenseValid = licenseExpiresIn > 0;
    }

    let overallStatus: 'compliant' | 'warning' | 'non_compliant' = 'compliant';
    if (!licenseValid || failedLabTests > 0) {
      overallStatus = 'non_compliant';
    } else if ((licenseExpiresIn !== undefined && licenseExpiresIn <= 30) || pendingCoaCount > 0) {
      overallStatus = 'warning';
    }

    return {
      licenseValid,
      licenseExpiresIn,
      pendingCoaCount,
      failedLabTests,
      overallStatus,
    };
  }

  async update(id: string, dto: Partial<Grower>): Promise<Grower> {
    const grower = await this.findById(id);
    Object.assign(grower, dto);
    return this.growersRepo.save(grower);
  }

  /**
   * Returns pesticide logs for the authenticated grower mapped to camelCase.
   * Returns [] if no grower profile exists.
   */
  async getMyPesticideLogs(userId: string): Promise<Record<string, unknown>[]> {
    const grower = await this.growersRepo.findOne({ where: { user_id: userId } });
    if (!grower) return [];

    const logs = await this.pesticideLogsRepo.find({
      where: { grower_id: grower.id },
      order: { applied_date: 'DESC' },
    });

    return logs.map((log) => ({
      id: log.id,
      productId: log.product_id,
      noPesticidesUsed: log.no_pesticides_used,
      pesticideName: log.pesticide_name,
      epaRegNumber: log.epa_reg_number,
      applicationRate: log.application_rate ?? undefined,
      appliedDate: log.applied_date,
      createdAt: log.created_at,
    }));
  }

  /**
   * Adds a pesticide log for the authenticated grower.
   * Creates grower profile lookup from userId, then delegates to addPesticideLog.
   */
  async addMyPesticideLog(userId: string, dto: Partial<PesticideLog>): Promise<Record<string, unknown>> {
    const grower = await this.growersRepo.findOne({ where: { user_id: userId } });
    if (!grower) throw new NotFoundException('No grower profile found — create your profile first');

    const log = await this.addPesticideLog(grower.id, dto);
    return {
      id: log.id,
      noPesticidesUsed: log.no_pesticides_used,
      pesticideName: log.pesticide_name,
      epaRegNumber: log.epa_reg_number,
      applicationRate: log.application_rate ?? undefined,
      appliedDate: log.applied_date,
      createdAt: log.created_at,
    };
  }

  // ─── COA upload and OCR parsing ───────────────────────────────────────────

  /**
   * COA upload flow:
   *  1. Receive PDF buffer from multipart upload
   *  2. Upload original PDF to S3 (growers/{grower_id}/coas/{timestamp}.pdf)
   *  3. Run Tesseract OCR on the PDF
   *  4. Parse the extracted text for key fields (THC%, CBD%, test date, lab name)
   *  5. Create LabTest record with status='parsed' and parse_confidence score
   *  6. Return parsed data to grower for review — grower confirms or corrects
   */
  async uploadCoa(
    growerId: string,
    productId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<LabTest> {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('COA must be a PDF file');
    }

    // 1. Upload to S3
    const s3Key = `growers/${growerId}/coas/${Date.now()}-${file.originalname}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: 'application/pdf',
        ServerSideEncryption: 'AES256',
      }),
    );

    // 2. OCR — Tesseract reads the PDF
    // For PDFs, Tesseract processes the first page as an image
    // Production improvement: use pdf2image to convert all pages first
    let parsedData: Partial<LabTest> = {};
    let parseConfidence = 0;

    try {
      const { data } = await Tesseract.recognize(file.buffer, 'eng', {
        logger: () => {}, // suppress Tesseract progress logs
      });

      parseConfidence = data.confidence / 100; // Tesseract returns 0-100, we store 0-1
      parsedData = this.parseCoaText(data.text);

      this.logger.log(`COA OCR complete for grower ${growerId}: confidence=${parseConfidence.toFixed(2)}`);
    } catch (err) {
      this.logger.error(`COA OCR failed for grower ${growerId}`, err);
      parseConfidence = 0;
    }

    // 3. Compute expiry date (tested_at + COA validity days)
    const testedAt = parsedData.tested_at ?? new Date().toISOString().split('T')[0];
    const expiryDate = this.computeExpiryDate(testedAt, 365); // Michigan: 365 days

    // 4. Create LabTest record
    const labTest = this.labTestsRepo.create({
      product_id: productId,
      grower_id: growerId,
      coa_s3_key: s3Key,
      lab_name: parsedData.lab_name ?? 'Unknown Lab',
      thc_percentage: parsedData.thc_percentage ?? null,
      thca_percentage: parsedData.thca_percentage ?? null,
      cbd_percentage: parsedData.cbd_percentage ?? null,
      pesticide_panel: parsedData.pesticide_panel ?? null,
      heavy_metals_panel: parsedData.heavy_metals_panel ?? null,
      microbials_panel: parsedData.microbials_panel ?? null,
      overall_pass: parsedData.overall_pass ?? false,
      parse_confidence: parseConfidence,
      raw_parsed_data: { ocr_text_length: (parsedData as any).text_length },
      status: parseConfidence >= 0.7 ? 'parsed' : 'pending_parse',
      tested_at: testedAt,
      expiry_date: expiryDate,
    });

    return this.labTestsRepo.save(labTest);
  }

  async getCoas(growerId: string): Promise<LabTest[]> {
    return this.labTestsRepo.find({
      where: { grower_id: growerId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Grower reviews OCR output and confirms or corrects the parsed values.
   * After confirmation, the product can be activated on the dispensary menu.
   */
  async confirmCoa(coaId: string, confirmedData: Partial<LabTest>): Promise<LabTest> {
    const labTest = await this.labTestsRepo.findOne({ where: { id: coaId } });
    if (!labTest) throw new NotFoundException(`COA ${coaId} not found`);

    Object.assign(labTest, confirmedData, { status: 'confirmed' });
    return this.labTestsRepo.save(labTest);
  }

  // ─── Pesticide logs ───────────────────────────────────────────────────────

  async addPesticideLog(growerId: string, dto: Partial<PesticideLog>): Promise<PesticideLog> {
    const log = this.pesticideLogsRepo.create({ ...dto, grower_id: growerId });
    const saved = await this.pesticideLogsRepo.save(log);

    // If EPA reg number provided, verify it asynchronously
    if (saved.epa_reg_number) {
      this.verifyEpaRegistration(saved.id, saved.epa_reg_number).catch((err) =>
        this.logger.error(`EPA verification failed for log ${saved.id}`, err),
      );
    }

    return saved;
  }

  async getPesticideLogs(growerId: string): Promise<PesticideLog[]> {
    return this.pesticideLogsRepo.find({
      where: { grower_id: growerId },
      order: { applied_date: 'DESC' },
    });
  }

  // ─── Presigned URL ────────────────────────────────────────────────────────

  async getCoaUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.s3Bucket, Key: s3Key });
    return getSignedUrl(this.s3, command, { expiresIn: 300 });
  }

  // ─── Private — License verification ──────────────────────────────────────

  private async verifyLicenseAsync(growerId: string): Promise<void> {
    const grower = await this.findById(growerId);

    // TODO: Call compliance service license/verify endpoint
    // For Phase 1: mark as verified after a stub check
    this.logger.log(`License verification stub for grower ${growerId}: ${grower.license_number}`);

    await this.growersRepo.update(growerId, {
      verification_status: 'license_verified',
      license_verified_at: new Date(),
    });
  }

  // ─── Private — EPA verification ───────────────────────────────────────────

  private async verifyEpaRegistration(logId: string, epaRegNumber: string): Promise<void> {
    // TODO: Call EPA pesticide registration API
    // GET https://ordspub.epa.gov/ords/pesticides/apprilma/api/product/{epa_reg_number}
    // Validates: product is registered, label permits cannabis application

    this.logger.log(`EPA verification stub for reg# ${epaRegNumber}`);

    // Stub: mark as verified
    await this.pesticideLogsRepo.update(logId, {
      epa_verified: true,
      epa_verified_at: new Date(),
      epa_verified_name: 'EPA Verified (stub)',
    });
  }

  // ─── Private — COA text parser ────────────────────────────────────────────

  /**
   * Extracts structured data from raw OCR text.
   * COA formats vary by lab — this handles common patterns.
   *
   * Production improvement: train a document ML model on common MI lab formats
   * (Purity Labs, ProVerde, Viridis, SC Labs) for higher parse_confidence.
   */
  private parseCoaText(text: string): Partial<LabTest> {
    const result: Partial<LabTest & { text_length: number }> = {
      text_length: text.length,
    };

    // THC% — matches patterns like "THC: 22.4%" or "Total THC 22.4 %"
    const thcMatch = text.match(/(?:Total\s+)?THC[A]?\s*[:\s]+(\d+\.?\d*)\s*%/i);
    if (thcMatch) result.thc_percentage = parseFloat(thcMatch[1]);

    // THCA%
    const thcaMatch = text.match(/THCA?\s*[:\s]+(\d+\.?\d*)\s*%/i);
    if (thcaMatch) result.thca_percentage = parseFloat(thcaMatch[1]);

    // CBD%
    const cbdMatch = text.match(/(?:Total\s+)?CBD[A]?\s*[:\s]+(\d+\.?\d*)\s*%/i);
    if (cbdMatch) result.cbd_percentage = parseFloat(cbdMatch[1]);

    // Test date — matches "Test Date: 2024-01-15" or "Tested: January 15, 2024"
    const dateMatch = text.match(/(?:test(?:ed)?\s+date?|date\s+tested)\s*[:\s]+(\d{4}-\d{2}-\d{2}|\w+ \d+,? \d{4})/i);
    if (dateMatch) {
      try {
        result.tested_at = new Date(dateMatch[1]).toISOString().split('T')[0];
      } catch {
        // Invalid date format — leave as default
      }
    }

    // Lab name — first line often contains lab name
    const firstLines = text.split('\n').slice(0, 5).join(' ');
    const labMatch = firstLines.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)* (?:Labs?|Laboratory|Laboratories|Testing|Analytics))/);
    if (labMatch) result.lab_name = labMatch[1];

    // Pesticide panel result
    if (/pesticide.*pass/i.test(text)) result.pesticide_panel = 'pass';
    else if (/pesticide.*fail/i.test(text)) result.pesticide_panel = 'fail';

    // Heavy metals panel
    if (/heavy metals.*pass/i.test(text)) result.heavy_metals_panel = 'pass';
    else if (/heavy metals.*fail/i.test(text)) result.heavy_metals_panel = 'fail';

    // Overall pass/fail
    result.overall_pass = /overall.*pass|pass.*overall/i.test(text) && !/fail/i.test(text);

    return result;
  }

  private computeExpiryDate(testedAt: string, validityDays: number): string {
    const date = new Date(testedAt);
    date.setDate(date.getDate() + validityDays);
    return date.toISOString().split('T')[0];
  }
}
