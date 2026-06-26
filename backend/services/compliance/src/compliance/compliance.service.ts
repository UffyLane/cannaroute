import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ComplianceRules } from '../entities/compliance-rules.entity';
import { PurchaseLimit } from '../entities/purchase-limit.entity';

interface OrderItem {
  product_category: string;
  weight_grams: number;
  thc_percentage?: number;
  quantity: number;
}

interface CheckOrderParams {
  customer_id: string;
  state_code: string;
  items: OrderItem[];
  dispensary_id: string;
  is_medical?: boolean;
}

interface ComplianceCheckResult {
  passed: boolean;
  details: string[];
  notes: Record<string, unknown>;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(ComplianceRules)
    private readonly rulesRepo: Repository<ComplianceRules>,

    @InjectRepository(PurchaseLimit)
    private readonly limitsRepo: Repository<PurchaseLimit>,

    private readonly config: ConfigService,
  ) {}

  // ─── Order compliance check (called by order service) ─────────────────────

  /**
   * The core compliance gate. Called before every order is created.
   *
   * Checks:
   *  1. Delivery is allowed in this state
   *  2. Current time is within delivery hours
   *  3. Customer hasn't exceeded daily purchase limits
   *  4. Order itself doesn't exceed per-transaction limits
   *
   * Returns { passed: true } or { passed: false, details: [...reasons] }
   */
  async checkOrder(params: CheckOrderParams): Promise<ComplianceCheckResult> {
    const rules = await this.getRules(params.state_code);
    const details: string[] = [];

    // 1. Delivery allowed in this state?
    if (!rules.delivery_allowed) {
      return {
        passed: false,
        details: [`Cannabis delivery is not permitted in ${rules.state_name}`],
        notes: { check: 'delivery_allowed', state: params.state_code },
      };
    }

    // 2. Within delivery hours?
    const hoursCheck = this.checkDeliveryHours(rules);
    if (!hoursCheck.allowed) {
      details.push(hoursCheck.reason!);
    }

    // 3. Calculate order quantities by category
    const orderTotals = this.sumOrderItems(params.items);

    // 4. Per-transaction limits
    const txnCheck = this.checkTransactionLimits(orderTotals, rules, params.is_medical ?? false);
    details.push(...txnCheck.violations);

    // 5. Daily purchase limits (cumulative)
    const today = new Date().toISOString().split('T')[0];
    const todayPurchases = await this.getTodayPurchases(params.customer_id, params.state_code, today);
    const cumulativeCheck = this.checkCumulativeLimits(orderTotals, todayPurchases, rules, params.is_medical ?? false);
    details.push(...cumulativeCheck.violations);

    const passed = details.length === 0;

    this.logger.log(
      `Compliance check for customer ${params.customer_id} in ${params.state_code}: ${passed ? 'PASSED' : 'FAILED'}`
    );

    return {
      passed,
      details,
      notes: {
        state_code: params.state_code,
        is_medical: params.is_medical,
        order_totals: orderTotals,
        today_prior_purchases: todayPurchases,
        delivery_hours_ok: hoursCheck.allowed,
      },
    };
  }

  // ─── Record purchase (called after successful delivery) ───────────────────

  async recordPurchase(params: {
    customer_id: string;
    order_id: string;
    state_code: string;
    items: OrderItem[];
    is_medical: boolean;
  }): Promise<PurchaseLimit> {
    const totals = this.sumOrderItems(params.items);
    const today = new Date().toISOString().split('T')[0];

    const record = this.limitsRepo.create({
      customer_id: params.customer_id,
      order_id: params.order_id,
      state_code: params.state_code,
      purchase_date: today,
      flower_grams: totals.flower_grams,
      concentrate_grams: totals.concentrate_grams,
      edible_thc_mg: totals.edible_thc_mg,
      is_medical: params.is_medical,
    });

    return this.limitsRepo.save(record);
  }

  // ─── Get customer purchase limits ─────────────────────────────────────────

  async getPurchaseLimits(customerId: string, stateCode: string) {
    const rules = await this.getRules(stateCode);
    const today = new Date().toISOString().split('T')[0];
    const todayPurchases = await this.getTodayPurchases(customerId, stateCode, today);

    return {
      state_code: stateCode,
      today: today,
      purchased_today: todayPurchases,
      limits: {
        flower_grams: rules.adult_use_flower_limit_grams,
        concentrate_grams: rules.adult_use_concentrate_limit_grams,
        edible_thc_mg: rules.adult_use_edible_thc_limit_mg,
      },
      remaining: {
        flower_grams: Math.max(0, (rules.adult_use_flower_limit_grams ?? 0) - todayPurchases.flower_grams),
        concentrate_grams: Math.max(0, (rules.adult_use_concentrate_limit_grams ?? 0) - todayPurchases.concentrate_grams),
        edible_thc_mg: Math.max(0, (rules.adult_use_edible_thc_limit_mg ?? 0) - todayPurchases.edible_thc_mg),
      },
    };
  }

  // ─── State rules CRUD ─────────────────────────────────────────────────────

  async getRules(stateCode: string): Promise<ComplianceRules> {
    const rules = await this.rulesRepo.findOne({ where: { state_code: stateCode } });
    if (!rules) throw new NotFoundException(`No compliance rules found for state: ${stateCode}`);
    return rules;
  }

  async getAllRules(): Promise<ComplianceRules[]> {
    return this.rulesRepo.find({ order: { state_code: 'ASC' } });
  }

  async upsertRules(stateCode: string, dto: Partial<ComplianceRules>): Promise<ComplianceRules> {
    await this.rulesRepo.upsert({ ...dto, state_code: stateCode }, ['state_code']);
    return this.getRules(stateCode);
  }

  // ─── License verification ─────────────────────────────────────────────────

  async verifyLicense(params: { license_number: string; state_code: string; license_type: string }) {
    const rules = await this.getRules(params.state_code);

    // TODO: Call state licensing API (rules.license_api_url)
    // Michigan: MI CRA via Accela — GET /licenses/{license_number}
    // Response: { status: 'active'|'expired'|'suspended', licensee_name, expiry_date }
    this.logger.log(`License verify stub: ${params.license_number} in ${params.state_code}`);

    return {
      license_number: params.license_number,
      state_code: params.state_code,
      verified: true, // stub — replace with real API call
      status: 'active',
      source: rules.license_api_url ?? 'manual_review',
    };
  }

  // ─── Metrc sale reporting ─────────────────────────────────────────────────

  /**
   * Reports a completed delivery sale to Metrc.
   * Called by the delivery service after delivery is confirmed complete.
   *
   * Metrc requires:
   *  - Package tags for each item sold
   *  - Customer's patient/caregiver ID (medical) or just transaction record (adult-use)
   *  - Sale datetime, quantity, price
   *
   * TODO: Implement real Metrc API v2 call.
   * Metrc endpoint: POST /sales/v1/receipts
   */
  async reportSaleToMetrc(orderId: string): Promise<{ metrc_transfer_id: string | null }> {
    this.logger.log(`Metrc sale report triggered for order ${orderId}`);

    // TODO: Fetch order details, build Metrc payload, POST to Metrc API
    // const order = await this.orderServiceClient.getOrder(orderId);
    // const payload = this.buildMetrcPayload(order);
    // const response = await this.metrcClient.post('/sales/v1/receipts', payload);
    // return { metrc_transfer_id: response.data.id };

    return { metrc_transfer_id: null }; // stub
  }

  // ─── Manifest generation ──────────────────────────────────────────────────

  async generateManifest(orderId: string) {
    // Manifest format varies by state — Michigan uses Metrc transfer manifest
    // TODO: Build state-appropriate manifest from order + delivery data
    return {
      manifest_id: `MAN-${orderId.slice(0, 8).toUpperCase()}`,
      order_id: orderId,
      generated_at: new Date().toISOString(),
      format: 'metrc_transfer', // Michigan
      status: 'generated',
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private sumOrderItems(items: OrderItem[]) {
    let flower_grams = 0;
    let concentrate_grams = 0;
    let edible_thc_mg = 0;

    for (const item of items) {
      const totalWeight = item.weight_grams * item.quantity;
      const category = item.product_category.toLowerCase();

      if (['flower', 'preroll'].includes(category)) {
        flower_grams += totalWeight;
      } else if (['concentrate', 'vape', 'extract'].includes(category)) {
        concentrate_grams += totalWeight;
      } else if (['edible', 'tincture', 'beverage'].includes(category)) {
        // Estimate THC mg from weight and THC percentage
        const thcPct = item.thc_percentage ?? 10; // conservative default
        edible_thc_mg += Math.round((totalWeight * thcPct * 10)); // weight_g * %thc * 10 = mg
      }
    }

    return { flower_grams, concentrate_grams, edible_thc_mg };
  }

  private checkDeliveryHours(rules: ComplianceRules): { allowed: boolean; reason?: string } {
    if (!rules.delivery_hours_start || !rules.delivery_hours_end) {
      return { allowed: true };
    }

    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (currentHHMM < rules.delivery_hours_start || currentHHMM > rules.delivery_hours_end) {
      return {
        allowed: false,
        reason: `Delivery is only available ${rules.delivery_hours_start}–${rules.delivery_hours_end} in ${rules.state_code}`,
      };
    }

    return { allowed: true };
  }

  private checkTransactionLimits(
    totals: ReturnType<typeof this.sumOrderItems>,
    rules: ComplianceRules,
    isMedical: boolean,
  ) {
    const violations: string[] = [];

    const flowerLimit = isMedical ? rules.medical_flower_limit_grams : rules.adult_use_flower_limit_grams;
    const concentrateLimit = isMedical ? rules.medical_concentrate_limit_grams : rules.adult_use_concentrate_limit_grams;
    const edibleLimit = isMedical ? rules.medical_edible_thc_limit_mg : rules.adult_use_edible_thc_limit_mg;

    if (flowerLimit && totals.flower_grams > flowerLimit) {
      violations.push(`Flower quantity (${totals.flower_grams}g) exceeds ${rules.state_code} per-transaction limit of ${flowerLimit}g`);
    }
    if (concentrateLimit && totals.concentrate_grams > concentrateLimit) {
      violations.push(`Concentrate quantity (${totals.concentrate_grams}g) exceeds ${rules.state_code} per-transaction limit of ${concentrateLimit}g`);
    }
    if (edibleLimit && totals.edible_thc_mg > edibleLimit) {
      violations.push(`Edible THC (${totals.edible_thc_mg}mg) exceeds ${rules.state_code} per-transaction limit of ${edibleLimit}mg`);
    }

    return { violations };
  }

  private checkCumulativeLimits(
    orderTotals: ReturnType<typeof this.sumOrderItems>,
    todayPurchases: ReturnType<typeof this.sumOrderItems>,
    rules: ComplianceRules,
    isMedical: boolean,
  ) {
    const violations: string[] = [];

    const flowerLimit = isMedical ? rules.medical_flower_limit_grams : rules.adult_use_flower_limit_grams;
    const concentrateLimit = isMedical ? rules.medical_concentrate_limit_grams : rules.adult_use_concentrate_limit_grams;
    const edibleLimit = isMedical ? rules.medical_edible_thc_limit_mg : rules.adult_use_edible_thc_limit_mg;

    if (flowerLimit) {
      const total = todayPurchases.flower_grams + orderTotals.flower_grams;
      if (total > flowerLimit) {
        violations.push(
          `Daily flower limit exceeded: ${todayPurchases.flower_grams}g already purchased today + ${orderTotals.flower_grams}g in this order = ${total}g (limit: ${flowerLimit}g)`
        );
      }
    }
    if (concentrateLimit) {
      const total = todayPurchases.concentrate_grams + orderTotals.concentrate_grams;
      if (total > concentrateLimit) {
        violations.push(
          `Daily concentrate limit exceeded: ${todayPurchases.concentrate_grams}g + ${orderTotals.concentrate_grams}g = ${total}g (limit: ${concentrateLimit}g)`
        );
      }
    }
    if (edibleLimit) {
      const total = todayPurchases.edible_thc_mg + orderTotals.edible_thc_mg;
      if (total > edibleLimit) {
        violations.push(
          `Daily edible THC limit exceeded: ${todayPurchases.edible_thc_mg}mg + ${orderTotals.edible_thc_mg}mg = ${total}mg (limit: ${edibleLimit}mg)`
        );
      }
    }

    return { violations };
  }

  private async getTodayPurchases(
    customerId: string,
    stateCode: string,
    today: string,
  ): Promise<{ flower_grams: number; concentrate_grams: number; edible_thc_mg: number }> {
    const result = await this.limitsRepo
      .createQueryBuilder('pl')
      .select('COALESCE(SUM(pl.flower_grams), 0)', 'flower_grams')
      .addSelect('COALESCE(SUM(pl.concentrate_grams), 0)', 'concentrate_grams')
      .addSelect('COALESCE(SUM(pl.edible_thc_mg), 0)', 'edible_thc_mg')
      .where('pl.customer_id = :customerId', { customerId })
      .andWhere('pl.state_code = :stateCode', { stateCode })
      .andWhere('pl.purchase_date = :today', { today })
      .getRawOne();

    return {
      flower_grams: parseFloat(result.flower_grams) || 0,
      concentrate_grams: parseFloat(result.concentrate_grams) || 0,
      edible_thc_mg: parseInt(result.edible_thc_mg) || 0,
    };
  }
}
