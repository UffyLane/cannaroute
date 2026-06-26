import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grower } from '../entities/grower.entity';
import { LabTest } from '../entities/lab-test.entity';
import { PesticideLog } from '../entities/pesticide-log.entity';
import { GrowerService } from './grower.service';
import { GrowerController } from './grower.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Grower, LabTest, PesticideLog])],
  controllers: [GrowerController],
  providers: [GrowerService],
  exports: [GrowerService],
})
export class GrowerModule {}
