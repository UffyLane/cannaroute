import { IsString, IsDateString } from 'class-validator';

export class VerifyAgeDto {
  // Session token returned by Stripe Identity / Persona SDK on the client.
  // We verify this server-side against the provider's API.
  @IsString()
  verification_session_token: string;

  // DOB extracted by the SDK — we cross-check against provider's result
  @IsDateString()
  dob_confirmed: string; // ISO date string: '1996-03-15'
}
