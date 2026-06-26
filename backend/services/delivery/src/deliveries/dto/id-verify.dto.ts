import { IsInt, Min, Max } from 'class-validator';

/**
 * Driver submits birth year only after visually inspecting the customer's ID at the door.
 * We never collect: ID number, full name from ID, full DOB, or ID images.
 *
 * Birth year alone lets us:
 *   1. Verify the customer is 21+ (audit-compliant for Michigan CRA)
 *   2. Store a compliance record without retaining PII
 *
 * The driver app UI is designed to enforce this — the field label is
 * "Year of birth from customer ID" with a year picker, no free text.
 */
export class IdVerifyDto {
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() - 21) // Must be at least 21
  customer_dob_year: number;
}
