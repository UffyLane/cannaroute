import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeliveryService } from './delivery.service';
import { UpdateGpsDto } from './dto/update-gps.dto';
import { IdVerifyDto } from './dto/id-verify.dto';
import { CaptureSignatureDto } from './dto/capture-signature.dto';
import { CurrentUser, Roles } from '@cannaroute/shared';
import { RequestUser } from '@cannaroute/shared';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * GET /deliveries/active
   * Driver's current active delivery with route + order details.
   */
  @Roles('driver')
  @Get('active')
  getActive(@CurrentUser() user: RequestUser) {
    return this.deliveryService.getActiveForDriver(user.id);
  }

  /**
   * GET /deliveries/driver/history
   * Driver's completed delivery history (last 20).
   */
  @Roles('driver')
  @Get('driver/history')
  getHistory(@CurrentUser() user: RequestUser) {
    return this.deliveryService.getDriverHistory(user.id);
  }

  /**
   * GET /deliveries/available-drivers
   * Internal endpoint — order service queries this when assigning a driver.
   * Dispensary admins + platform admins only.
   *
   * Query param: dispensary_id (TODO: add @Query decorator in Phase 2)
   */
  @Roles('dispensary_admin', 'platform_admin')
  @Get('available-drivers')
  getAvailableDrivers(@CurrentUser() user: RequestUser) {
    // TODO: pull dispensary_id from user's dispensary association
    return this.deliveryService.getAvailableDrivers('');
  }

  /**
   * GET /deliveries/:id
   * Full delivery detail including GPS route (post-delivery) and S3 presigned URLs.
   * Dispensary admin + driver + platform admin.
   */
  @Roles('driver', 'dispensary_admin', 'platform_admin')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const delivery = await this.deliveryService.findById(id);

    // Generate presigned S3 URLs on demand (5-min expiry)
    const [signatureUrl, photoUrl] = await Promise.all([
      delivery.signature_s3_key
        ? this.deliveryService.getPresignedUrl(delivery.signature_s3_key)
        : null,
      delivery.proof_photo_s3_key
        ? this.deliveryService.getPresignedUrl(delivery.proof_photo_s3_key)
        : null,
    ]);

    return {
      ...delivery,
      signature_url: signatureUrl,   // presigned, expires in 5 min
      proof_photo_url: photoUrl,     // presigned, expires in 5 min
      // Never expose s3 keys directly in response
      signature_s3_key: undefined,
      proof_photo_s3_key: undefined,
    };
  }

  /**
   * POST /deliveries/:id/gps
   * Driver sends GPS position update (~every 5 seconds).
   * Writes to Redis only — does NOT hit Postgres on every call.
   */
  @Roles('driver')
  @Post(':id/gps')
  @HttpCode(HttpStatus.OK)
  updateGps(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGpsDto,
  ) {
    return this.deliveryService.updateGps(id, dto);
  }

  /**
   * POST /deliveries/:id/id-verify
   * Driver confirms customer's age at the door.
   * Accepts birth year only — never ID number, name, or full DOB.
   */
  @Roles('driver')
  @Post(':id/id-verify')
  @HttpCode(HttpStatus.OK)
  verifyId(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: IdVerifyDto,
  ) {
    return this.deliveryService.verifyId(id, dto);
  }

  /**
   * POST /deliveries/:id/signature
   * Driver submits customer signature as a base64 PNG.
   * Service writes to S3 and stores key in delivery record.
   */
  @Roles('driver')
  @Post(':id/signature')
  @HttpCode(HttpStatus.OK)
  captureSignature(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CaptureSignatureDto,
  ) {
    return this.deliveryService.captureSignature(id, dto);
  }

  /**
   * POST /deliveries/:id/photo
   * Driver uploads proof-of-delivery photo (multipart/form-data).
   * Max 10MB, JPEG or PNG only.
   */
  @Roles('driver')
  @Post(':id/photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
          cb(new BadRequestException('Only JPEG and PNG images are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  capturePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Photo file is required');
    return this.deliveryService.capturePhoto(id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
    });
  }

  /**
   * POST /deliveries/:id/complete
   * Driver marks delivery complete.
   * Validates age verification + at least one proof of delivery exists.
   * Triggers GPS route harvest from Redis → Postgres.
   */
  @Roles('driver')
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryService.complete(id);
  }
}
