import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GrowerService } from './grower.service';
import { CurrentUser, Roles, RequestUser } from '@cannaroute/shared';

@Controller('grower')
export class GrowerController {
  constructor(private readonly growerService: GrowerService) {}

  /**
   * POST /grower
   * Create grower profile. Auto-triggers license verification.
   */
  @Roles('grower', 'platform_admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: RequestUser, @Body() dto: any) {
    return this.growerService.create(user.id, dto);
  }

  /**
   * GET /grower/:id
   * Public — customers see grower profiles on product detail pages.
   * Sensitive fields (user_id, license details) stripped for public view.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const grower = await this.growerService.findById(id);
    // Strip internal fields for public response
    const { user_id, ...publicProfile } = grower;
    return publicProfile;
  }

  /**
   * GET /grower/me
   * Grower views their own full profile.
   */
  @Roles('grower')
  @Get('me')
  getMe(@CurrentUser() user: RequestUser) {
    return this.growerService.findByUserId(user.id);
  }

  /**
   * PUT /grower/:id
   * Update grower profile — grower or platform admin only.
   */
  @Roles('grower', 'platform_admin')
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.growerService.update(id, dto);
  }

  /**
   * POST /grower/:id/coa
   * Upload COA PDF. Triggers S3 upload + Tesseract OCR parsing.
   * Returns parsed data for grower review before confirmation.
   */
  @Roles('grower', 'platform_admin')
  @Post(':id/coa')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('coa_pdf', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new Error('COA must be a PDF file'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  uploadCoa(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('product_id') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('COA PDF is required');
    if (!productId) throw new Error('product_id is required');
    return this.growerService.uploadCoa(id, productId, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
  }

  /**
   * GET /grower/:id/coas
   * List all COAs for this grower, newest first.
   */
  @Roles('grower', 'dispensary_admin', 'platform_admin')
  @Get(':id/coas')
  getCoas(@Param('id', ParseUUIDPipe) id: string) {
    return this.growerService.getCoas(id);
  }

  /**
   * POST /grower/:id/coa/:coaId/confirm
   * Grower confirms (and optionally corrects) OCR-parsed COA data.
   * After confirmation, the linked product becomes eligible for activation.
   */
  @Roles('grower', 'platform_admin')
  @Post(':id/coa/:coaId/confirm')
  @HttpCode(HttpStatus.OK)
  confirmCoa(
    @Param('coaId', ParseUUIDPipe) coaId: string,
    @Body() confirmedData: any,
  ) {
    return this.growerService.confirmCoa(coaId, confirmedData);
  }

  /**
   * POST /grower/:id/pesticide-logs
   * Add a pesticide application log.
   * Triggers async EPA registration number verification.
   */
  @Roles('grower', 'platform_admin')
  @Post(':id/pesticide-logs')
  @HttpCode(HttpStatus.CREATED)
  addPesticideLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.growerService.addPesticideLog(id, dto);
  }

  /**
   * GET /grower/:id/pesticide-logs
   * Public — customers can view pesticide history on product detail.
   * Transparency is the core value prop.
   */
  @Get(':id/pesticide-logs')
  getPesticideLogs(@Param('id', ParseUUIDPipe) id: string) {
    return this.growerService.getPesticideLogs(id);
  }
}
