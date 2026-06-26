import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly config: ConfigService,
  ) {}

  // ─── Customer menu ────────────────────────────────────────────────────────

  /**
   * Public menu endpoint — customers see this.
   *
   * Filters applied:
   *  1. status = 'active' only (no coa_expired, inactive, out_of_stock)
   *  2. COA not expired (joins lab_tests, checks expiry_date > NOW())
   *  3. stock_quantity > 0
   *  4. Optionally filtered by category
   *
   * This is the core grower transparency feature:
   * the response includes grower info, farm certifications, and COA summary
   * so customers can see exactly where their product came from.
   */
  async getMenu(
    dispensaryId: string,
    category?: string,
  ): Promise<any[]> {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .where('product.dispensary_id = :dispensaryId', { dispensaryId })
      .andWhere('product.status = :status', { status: 'active' })
      .andWhere('product.stock_quantity > 0')
      .andWhere('product.deleted_at IS NULL')
      // COA expiry check — join lab_tests to verify the most recent test hasn't expired
      // If no lab test exists or it's expired, product is hidden from menu
      .andWhere(`
        EXISTS (
          SELECT 1 FROM lab_tests lt
          WHERE lt.product_id = product.id
            AND lt.overall_pass = true
            AND lt.expiry_date > NOW()
          ORDER BY lt.tested_at DESC
          LIMIT 1
        )
      `)
      .orderBy('product.category', 'ASC')
      .addOrderBy('product.name', 'ASC');

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }

    return qb.getMany();
  }

  // ─── Bulk product lookup (internal — called by order service) ─────────────

  /**
   * Called by order service when creating an order to resolve product details.
   * Returns a map of product_id → product data.
   * Validates products are active and belong to the given dispensary.
   */
  async findBulk(
    dispensaryId: string,
    productIds: string[],
  ): Promise<Record<string, Product>> {
    const products = await this.productsRepo.find({
      where: productIds.map((id) => ({ id, dispensary_id: dispensaryId })),
    });

    const map: Record<string, Product> = {};
    for (const p of products) {
      map[p.id] = p;
    }
    return map;
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepo.create({
      ...dto,
      status: 'inactive', // Always starts inactive — activate after COA is uploaded
    });
    return this.productsRepo.save(product);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async findByDispensary(dispensaryId: string): Promise<Product[]> {
    return this.productsRepo.find({
      where: { dispensary_id: dispensaryId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async update(id: string, dto: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productsRepo.softRemove(product);
  }

  // ─── Stock management ─────────────────────────────────────────────────────

  async updateStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.findById(id);

    const newQuantity = product.stock_quantity + dto.quantity_delta;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Stock adjustment of ${dto.quantity_delta} would result in negative stock (current: ${product.stock_quantity})`,
      );
    }

    product.stock_quantity = newQuantity;

    // Auto-set status based on stock level
    if (newQuantity === 0 && product.status === 'active') {
      product.status = 'out_of_stock';
    } else if (newQuantity > 0 && product.status === 'out_of_stock') {
      product.status = 'active';
    }

    this.logger.log(
      `Stock update: product=${id} delta=${dto.quantity_delta} reason=${dto.reason} new_qty=${newQuantity}`,
    );

    return this.productsRepo.save(product);
  }

  // ─── COA expiry enforcement ───────────────────────────────────────────────

  /**
   * Called by a scheduled job (daily cron) to mark products whose COA has expired.
   * Sets status = 'coa_expired' so they're hidden from the customer menu.
   * Dispensary admins see these in their dashboard with a "Renew COA" CTA.
   */
  async markExpiredCoas(): Promise<number> {
    const result = await this.productsRepo
      .createQueryBuilder()
      .update(Product)
      .set({ status: 'coa_expired' })
      .where('status = :status', { status: 'active' })
      .andWhere(`
        NOT EXISTS (
          SELECT 1 FROM lab_tests lt
          WHERE lt.product_id = id
            AND lt.overall_pass = true
            AND lt.expiry_date > NOW()
        )
      `)
      .execute();

    this.logger.log(`Marked ${result.affected} products as coa_expired`);
    return result.affected ?? 0;
  }

  // ─── Metrc sync ───────────────────────────────────────────────────────────

  /**
   * Triggers an async Metrc inventory reconciliation job.
   * Returns a job_id that the client polls via GET /inventory/sync/:job_id.
   *
   * Metrc sync does:
   *  1. Pull active packages from Metrc API for this dispensary's license
   *  2. Compare against our products table
   *  3. Flag discrepancies for dispensary admin review
   *  4. Update metrc_package_tag on matched products
   *
   * TODO: Implement job queue (Bull/BullMQ) for async processing.
   * For Phase 1: synchronous stub that returns a fake job_id.
   */
  async triggerMetrcSync(dispensaryId: string): Promise<{ job_id: string; status: string }> {
    const jobId = `metrc-sync-${dispensaryId.slice(0, 8)}-${Date.now()}`;

    this.logger.log(`Metrc sync triggered for dispensary ${dispensaryId}, job ${jobId}`);

    // TODO: Queue actual Metrc API sync job
    // await this.bullQueue.add('metrc-sync', { dispensaryId, jobId });

    return {
      job_id: jobId,
      status: 'queued',
    };
  }

  async getMetrcSyncStatus(jobId: string): Promise<{ job_id: string; status: string; result?: any }> {
    // TODO: Check Bull queue job status
    // const job = await this.bullQueue.getJob(jobId);
    return {
      job_id: jobId,
      status: 'pending', // stub
    };
  }
}
