import { PartialType } from '@nestjs/mapped-types';
import { CreateGrowerDto } from './create-grower.dto';

/**
 * All fields from CreateGrowerDto become optional.
 * Users cannot update license_number or state_code directly —
 * those require a re-verification flow (handled separately in the service).
 */
export class UpdateGrowerDto extends PartialType(CreateGrowerDto) {}
