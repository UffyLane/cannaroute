import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Public, CurrentUser, Roles, RequestUser } from '@cannaroute/shared';

@Controller('inventory')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /inventory/menu?dispensary_id=&category=
   * Public — no auth required. Returns active products with valid COAs only.
   * This is what the customer app displays.
   */
  @Public()
  @Get('menu')
  getMenu(
    @Query('dispensary_id') dispensaryId: string,
    @Query('category') category?: string,
  ) {
    if (!dispensaryId) {
      return { error: 'dispensary_id query param is required' };
    }
    return this.productsService.getMenu(dispensaryId, category);
  }

  /**
   * GET /inventory/products
   * Dispensary admin sees ALL products including inactive/coa_expired.
   * Used by the dispensary dashboard inventory management screen.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Get('products')
  findAll(@CurrentUser() user: RequestUser, @Query('dispensary_id') dispensaryId: string) {
    const id = dispensaryId ?? '';
    return this.productsService.findByDispensary(id);
  }

  /**
   * POST /inventory/products
   * Create a new product. Starts as 'inactive' until COA is uploaded.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * PATCH /inventory/products/:id
   * Update product details. Price, name, description, etc.
   * Stock changes go through /stock endpoint for audit logging.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Patch('products/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, dto);
  }

  /**
   * DELETE /inventory/products/:id
   * Soft delete — product is hidden but order history is preserved.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  /**
   * PATCH /inventory/products/:id/stock
   * Adjust stock with a delta + reason for audit trail.
   * Auto-sets status to 'out_of_stock' when quantity hits 0.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Patch('products/:id/stock')
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.productsService.updateStock(id, dto);
  }

  /**
   * POST /inventory/sync/metrc
   * Trigger async Metrc package reconciliation for a dispensary.
   * Returns job_id to poll for completion.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Post('sync/metrc')
  triggerMetrcSync(@Query('dispensary_id') dispensaryId: string) {
    return this.productsService.triggerMetrcSync(dispensaryId);
  }

  /**
   * GET /inventory/sync/:job_id
   * Check status of a running Metrc sync job.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Get('sync/:jobId')
  getSyncStatus(@Param('jobId') jobId: string) {
    return this.productsService.getMetrcSyncStatus(jobId);
  }

  /**
   * POST /inventory/products/bulk (internal — called by order service)
   * Resolve product details for a list of product IDs.
   * Used during order creation to get price snapshot + COA status.
   */
  @Post('products/bulk')
  findBulk(
    @Body() body: { dispensary_id: string; product_ids: string[] },
  ) {
    return this.productsService.findBulk(body.dispensary_id, body.product_ids);
  }
}
