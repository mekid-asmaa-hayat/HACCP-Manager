import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Control } from '../controls/control.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Control])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
