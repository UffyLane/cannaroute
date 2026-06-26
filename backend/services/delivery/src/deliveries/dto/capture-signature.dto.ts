import { IsString, IsNotEmpty, Matches } from 'class-validator';

/**
 * Signature is uploaded as a base64 PNG from the driver app.
 * The service writes it to S3 and stores only the key.
 * Max size enforced in the controller via file size limit middleware.
 */
export class CaptureSignatureDto {
  // Base64-encoded PNG of the signature pad drawing
  @IsString()
  @IsNotEmpty()
  @Matches(/^data:image\/png;base64,/, { message: 'signature_data must be a base64 PNG data URI' })
  signature_data: string;
}
