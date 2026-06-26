import { IsUUID } from 'class-validator';

export class AssignDriverDto {
  @IsUUID()
  driver_id: string;
}
