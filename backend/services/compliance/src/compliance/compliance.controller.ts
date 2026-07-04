import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceRules } from '../entities/compliance-rules.entity';
import { CheckOrderDto } from './dto/check-order.dto';
import { CurrentUser, Roles, RequestUser } from '@cannaroute/shared';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * POST /compliance/check-order
   * Internal endpoint — called by order service before creating an order.
   * Validates purchase limits + delivery hours for the customer's state.
   * Not exposed to public clients.
   */
  @Post('check-order')
  @HttpCode(HttpStatus.OK)
  checkOrder(@Body() dto: CheckOrderDto) {
    return this.complianceService.checkOrder(dto);
  }

  /**
   * GET /compliance/rules
   * All active state rules — admin only.
   */
  @Roles('platform_admin')
  @Get('rules')
  getAllRules() {
    return this.complianceService.getAllRules();
  }

  /**
   * GET /compliance/rules/:state_code
   * Single state rules — dispensary admins can view their own state.
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Get('rules/:stateCode')
  getRules(@Param('stateCode') stateCode: string) {
    return this.complianceService.getRules(stateCode.toUpperCase());
  }

  /**
   * PUT /compliance/rules/:state_code
   * Update state compliance rules — platform admin only.
   * This is the Admin Panel UI — every field maps to a DB column.
   */
  @Roles('platform_admin')
  @Put('rules/:stateCode')
  updateRules(
    @Param('stateCode') stateCode: string,
    @Body() dto: Partial<ComplianceRules>,
  ) {
    return this.complianceService.upsertRules(stateCode.toUpperCase(), dto);
  }

  /**
   * POST /compliance/rules
   * Add a new state — platform admin only.
   * Adding a state = one INSERT. No code changes needed.
   */
  @Roles('platform_admin')
  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  createRules(@Body() dto: Partial<ComplianceRules> & { state_code: string }) {
    return this.complianceService.upsertRules(dto.state_code.toUpperCase(), dto);
  }

  /**
   * GET /compliance/purchase-limits/:customer_id
   * Customer's daily purchase totals + remaining allowance.
   * Used by the customer app to show a "purchase limit tracker".
   */
  @Get('purchase-limits/:customerId')
  getPurchaseLimits(
    @Param('customerId') customerId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const stateCode = user.state_code ?? 'MI';
    return this.complianceService.getPurchaseLimits(customerId, stateCode);
  }

  /**
   * POST /compliance/manifest/generate
   * Generate a state-compliant delivery manifest for an order.
   */
  @Roles('dispensary_admin', 'driver', 'platform_admin')
  @Post('manifest/generate')
  @HttpCode(HttpStatus.OK)
  generateManifest(@Body() body: { order_id: string }) {
    return this.complianceService.generateManifest(body.order_id);
  }

  /**
   * POST /compliance/license/verify
   * Verify a dispensary or grower license against the state licensing API.
   */
  @Roles('platform_admin', 'dispensary_admin')
  @Post('license/verify')
  @HttpCode(HttpStatus.OK)
  verifyLicense(
    @Body() body: { license_number: string; state_code: string; license_type: string },
  ) {
    return this.complianceService.verifyLicense(body);
  }

  /**
   * POST /compliance/metrc/report-sale
   * Report a completed sale to Metrc — called by delivery service post-delivery.
   */
  @Post('metrc/report-sale')
  @HttpCode(HttpStatus.OK)
  reportSale(@Body() body: { order_id: string }) {
    return this.complianceService.reportSaleToMetrc(body.order_id);
  }
}
