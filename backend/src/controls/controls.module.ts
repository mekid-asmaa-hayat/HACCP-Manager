import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlsService } from './controls.service';
import { ControlsController } from './controls.controller';
import { Control } from './control.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Control])],
  providers: [ControlsService],
  controllers: [ControlsController],
  exports: [ControlsService],
})
export class ControlsModule {}
