import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { OrdersGateway } from '../gateways/orders.gateway';
import { RequestUser, OrderStatus } from '@cannaroute/shared';

// Valid status transitions — enforces the state machine
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  placed:     ['confirmed', 'cancelled'],
  confirmed:  ['preparing', 'cancelled'],
  preparing:  ['picked_up', 'cancelled'],
  picked_up:  ['in_transit'],
  in_transit: ['delivered'],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly itemsRepo: Repository<OrderItem>,

    private readonly dataSource: DataSource,
    private readonly ordersGateway: OrdersGateway,
    private readonly configService: ConfigService,
  ) {}

  // ─── Notification helper ──────────────────────────────────────────────────

  private async notify(params: {
    event: string;
    user_id: string;
    order_id: string;
    dispensary_name?: string;
    estimated_minutes?: number;
    total_formatted?: string;
  }): Promise<void> {
    const notifUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://localhost:3007');
    try {
      await fetch(`${notifUrl}/api/v1/notifications/order-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'order-service',
        },
        body: JSON.stringify(params),
      });
    } catch (err) {
      this.logger.warn(`Notification service unreachable for event ${params.event}`, err);
      // Non-fatal — order state change still succeeds
    }
  }

  // ─── Create Order ─────────────────────────────────────────────────────────

  async create(customerId: string, dto: CreateOrderDto): Promise<Order> {
    // 1. Fetch product data for each item from inventory service
    //    (resolves price, weight_grams, COA status, category)
    const enrichedItems = await this.fetchProductData(dto.dispensary_id, dto.items);

    // 2. Compute pricing
    const subtotal_cents = enrichedItems.reduce((sum, i) => sum + i.subtotal_cents, 0);
    const platform_fee_cents = Math.floor(subtotal_cents * 0.10); // 10% max (280E constraint)
    const tax_cents = await this.computeTax(dto.delivery_address_state, subtotal_cents);
    const delivery_fee_cents = 500; // $5.00 flat — will become dynamic in Phase 2
    const total_cents = subtotal_cents + tax_cents + delivery_fee_cents + platform_fee_cents;

    // 3. Compliance check — calls compliance service
    const complianceResult = await this.checkCompliance({
      customer_id: customerId,
      state_code: dto.delivery_address_state,
      items: enrichedItems,
      dispensary_id: dto.dispensary_id,
    });

    if (!complianceResult.passed) {
      throw new UnprocessableEntityException({
        error: 'compliance_check_failed',
        details: complianceResult.details,
      });
    }

    // 4. Persist order + items in a single transaction
    const order = await this.dataSource.transaction(async (manager) => {
      const newOrder = manager.create(Order, {
        customer_id: customerId,
        dispensary_id: dto.dispensary_id,
        status: 'placed' as OrderStatus,
        subtotal_cents,
        tax_cents,
        delivery_fee_cents,
        platform_fee_cents,
        total_cents,
        payment_method: dto.payment_method,
        payment_status: 'pending',
        delivery_address_line1: dto.delivery_address_line1,
        delivery_address_line2: dto.delivery_address_line2 ?? null,
        delivery_address_city: dto.delivery_address_city,
        delivery_address_state: dto.delivery_address_state,
        delivery_address_zip: dto.delivery_address_zip,
        scheduled_delivery_at: dto.scheduled_delivery_at ? new Date(dto.scheduled_delivery_at) : null,
        compliance_check_passed: true,
        compliance_check_notes: complianceResult.notes,
      });

      const savedOrder = await manager.save(Order, newOrder);

      const itemEntities = enrichedItems.map((item) =>
        manager.create(OrderItem, { ...item, order_id: savedOrder.id }),
      );
      await manager.save(OrderItem, itemEntities);

      return savedOrder;
    });

    // 5. Notify dispensary dashboard via WebSocket
    this.ordersGateway.emitOrderStatusChange(order.id, order.dispensary_id, 'placed');

    // 6. Push notification to dispensary staff
    this.notify({ event: 'order_placed', user_id: dto.dispensary_id, order_id: order.id });

    this.logger.log(`Order ${order.id} created by customer ${customerId}`);

    return this.findById(order.id);
  }

  // ─── List Orders ──────────────────────────────────────────────────────────

  async findAll(user: RequestUser, limit?: number, sort?: string): Promise<Order[]> {
    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.created_at', 'DESC');

    if (user.role === 'customer') {
      qb.where('order.customer_id = :id', { id: user.id });
    } else if (user.role === 'dispensary_admin') {
      // For demo: dispensary_admin sees all orders (dispensary_users join is Phase 2)
      // No filter applied — safe fallback so dashboard renders
    } else if (user.role === 'driver') {
      qb.where('order.driver_id = :id', { id: user.id });
    }
    // platform_admin sees all — no filter

    if (limit) qb.take(limit);

    return qb.getMany();
  }

  // ─── Dashboard Stats ──────────────────────────────────────────────────────

  async getStatsToday(user: RequestUser) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const todayOrders = await this.ordersRepo
        .createQueryBuilder('order')
        .where('order.created_at >= :today', { today })
        .getMany();

      const weeklyData: { date: string; revenue: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayOrders = await this.ordersRepo
          .createQueryBuilder('order')
          .where('order.created_at >= :day AND order.created_at < :nextDay', { day, nextDay })
          .getMany();

        weeklyData.push({
          date: day.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayOrders.reduce((sum, o) => sum + (o.total_cents ?? 0) / 100, 0),
        });
      }

      return {
        ordersToday: todayOrders.length,
        revenueToday: todayOrders.reduce((sum, o) => sum + (o.total_cents ?? 0) / 100, 0),
        activeDrivers: 0,
        pendingOrders: todayOrders.filter(o => o.status === 'placed').length,
        weeklyData,
      };
    } catch {
      // Return zeroed stats if DB query fails — dashboard still renders
      return { ordersToday: 0, revenueToday: 0, activeDrivers: 0, pendingOrders: 0, weeklyData: [] };
    }
  }

  // ─── Get Single Order ─────────────────────────────────────────────────────

  async findById(orderId: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  // ─── Status Transitions ───────────────────────────────────────────────────

  async confirm(orderId: string, dto: AssignDriverDto): Promise<Order> {
    const order = await this.findById(orderId);
    this.assertTransition(order.status, 'confirmed');

    order.status = 'confirmed';
    order.driver_id = dto.driver_id;
    const saved = await this.ordersRepo.save(order);

    // Notify customer + emit new job to driver
    this.ordersGateway.emitOrderConfirmed({
      order_id: saved.id,
      dispensary_id: saved.dispensary_id,
      estimated_minutes: 30, // TODO: compute from Google Maps distance matrix
    });
    this.ordersGateway.emitNewJob(dto.driver_id, {
      order_id: saved.id,
      dispensary_id: saved.dispensary_id,
      delivery_address: `${saved.delivery_address_line1}, ${saved.delivery_address_city}`,
      item_count: saved.items?.length ?? 0,
      total_cents: saved.total_cents,
    });

    // Notify customer — order confirmed
    this.notify({ event: 'order_confirmed', user_id: saved.customer_id, order_id: saved.id, estimated_minutes: 30 });
    // Notify driver — new job assigned
    this.notify({ event: 'job_assigned', user_id: dto.driver_id, order_id: saved.id,
      total_formatted: `$${(saved.total_cents / 100).toFixed(2)}` });

    return saved;
  }

  async markPickedUp(orderId: string): Promise<Order> {
    const order = await this.transition(orderId, 'picked_up');
    this.notify({ event: 'order_picked_up', user_id: order.customer_id, order_id: order.id });
    return order;
  }

  async markInTransit(orderId: string): Promise<Order> {
    const order = await this.transition(orderId, 'in_transit');
    this.notify({ event: 'order_in_transit', user_id: order.customer_id, order_id: order.id });
    return order;
  }

  async markDelivered(orderId: string): Promise<Order> {
    const order = await this.transition(orderId, 'delivered');

    this.ordersGateway.emitOrderDelivered({
      order_id: order.id,
      dispensary_id: order.dispensary_id,
      delivered_at: new Date().toISOString(),
    });

    this.notify({ event: 'order_delivered', user_id: order.customer_id, order_id: order.id });

    // TODO: trigger compliance service to report sale to Metrc
    // this.complianceClient.reportSale(order.id);

    return order;
  }

  async cancel(orderId: string, dto: CancelOrderDto, user: RequestUser): Promise<Order> {
    const order = await this.findById(orderId);
    this.assertTransition(order.status, 'cancelled');

    // Customers can only cancel their own orders before 'preparing'
    if (user.role === 'customer') {
      if (order.customer_id !== user.id) throw new ForbiddenException();
      if (['preparing', 'picked_up', 'in_transit', 'delivered'].includes(order.status)) {
        throw new BadRequestException('Order is already being prepared and cannot be cancelled');
      }
    }

    order.status = 'cancelled';
    order.cancelled_reason = dto.reason;
    const saved = await this.ordersRepo.save(order);

    this.ordersGateway.emitOrderStatusChange(order.id, order.dispensary_id, 'cancelled');
    this.notify({ event: 'order_cancelled', user_id: saved.customer_id, order_id: saved.id });

    return saved;
  }

  // ─── Payment Status Update ────────────────────────────────────────────────

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order> {
    const order = await this.findById(orderId);
    const validStatuses = ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      throw new BadRequestException(`Invalid payment status: ${paymentStatus}`);
    }
    order.payment_status = paymentStatus;
    return this.ordersRepo.save(order);
  }

  // ─── Delivery Manifest ────────────────────────────────────────────────────

  async getManifest(orderId: string) {
    const order = await this.findById(orderId);

    // Manifest is returned to driver at pickup — includes product details + delivery address
    // Does NOT include customer personal info beyond first name + delivery address
    return {
      manifest_id: `MAN-${order.id.slice(0, 8).toUpperCase()}`,
      order_id: order.id,
      dispensary_id: order.dispensary_id,
      driver_id: order.driver_id,
      delivery_address: {
        line1: order.delivery_address_line1,
        line2: order.delivery_address_line2,
        city: order.delivery_address_city,
        state: order.delivery_address_state,
        zip: order.delivery_address_zip,
        lat: order.delivery_lat,
        lng: order.delivery_lng,
      },
      items: (order.items ?? []).map((item) => ({
        product_name: item.product_name,
        product_category: item.product_category,
        quantity: item.quantity,
        weight_grams: item.weight_grams,
        batch_id: item.batch_id,
      })),
      generated_at: new Date().toISOString(),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private assertTransition(current: OrderStatus, next: OrderStatus) {
    const allowed = ALLOWED_TRANSITIONS[current] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition order from '${current}' to '${next}'`,
      );
    }
  }

  private async transition(orderId: string, next: OrderStatus): Promise<Order> {
    const order = await this.findById(orderId);
    this.assertTransition(order.status, next);
    order.status = next;
    const saved = await this.ordersRepo.save(order);
    this.ordersGateway.emitOrderStatusChange(order.id, order.dispensary_id, next);
    return saved;
  }

  /**
   * Calls the inventory service to resolve product details for each item.
   * Returns enriched items with price snapshot, weight, category.
   *
   * TODO: Replace with @nestjs/microservices (TCP or Redis transport) in Phase 2.
   * For Phase 1: direct HTTP call to inventory service.
   */
  private async fetchProductData(
    dispensaryId: string,
    items: { product_id: string; quantity: number }[],
  ) {
    const inventoryUrl = this.configService.get<string>('INVENTORY_SERVICE_URL', 'http://localhost:3004');

    try {
      const res = await fetch(`${inventoryUrl}/api/v1/inventory/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispensary_id: dispensaryId, product_ids: items.map((i) => i.product_id) }),
      });

      if (!res.ok) throw new Error(`Inventory service returned ${res.status}`);

      const products: Record<string, any> = await res.json();

      return items.map((item) => {
        const p = products[item.product_id];
        if (!p) throw new BadRequestException(`Product ${item.product_id} not found`);
        if (p.status !== 'active') throw new UnprocessableEntityException(`Product ${p.name} is not available`);

        return {
          product_id: item.product_id,
          batch_id: p.current_batch_id ?? null,
          product_name: p.name,
          product_category: p.category,
          thc_percentage: p.thc_percentage,
          cbd_percentage: p.cbd_percentage,
          weight_grams: p.weight_grams * item.quantity,
          quantity: item.quantity,
          unit_price_cents: p.price_cents,
          subtotal_cents: p.price_cents * item.quantity,
        };
      });
    } catch (err) {
      this.logger.error('Failed to fetch product data from inventory service', err);
      throw new BadRequestException('Could not validate products — please try again');
    }
  }

  /**
   * Calls the compliance service to check purchase limits and delivery rules.
   * Internal endpoint — no customer auth needed, uses internal JWT claim.
   *
   * TODO: Wire up service-to-service JWT in Phase 2.
   */
  private async checkCompliance(params: {
    customer_id: string;
    state_code: string;
    items: any[];
    dispensary_id: string;
  }) {
    const complianceUrl = this.configService.get<string>('COMPLIANCE_SERVICE_URL', 'http://localhost:3005');

    try {
      const res = await fetch(`${complianceUrl}/api/v1/compliance/check-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'order-service', // Phase 1 internal auth header
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) throw new Error(`Compliance service returned ${res.status}`);
      return res.json(); // { passed: bool, details: string[], notes: Record }
    } catch (err) {
      this.logger.error('Compliance service unreachable', err);
      // Fail open in development, fail closed in production
      if (this.configService.get('NODE_ENV') === 'production') {
        throw new UnprocessableEntityException('Compliance check temporarily unavailable');
      }
      return { passed: true, details: [], notes: { dev_bypass: true } };
    }
  }

  private async computeTax(stateCode: string, subtotalCents: number): Promise<number> {
    // TODO: fetch tax rate from compliance_rules table via compliance service
    // Michigan excise tax: 10% + 6% sales tax = 16% on cannabis
    const TAX_RATES: Record<string, number> = {
      MI: 0.16,
    };
    const rate = TAX_RATES[stateCode] ?? 0.10;
    return Math.floor(subtotalCents * rate);
  }
}
