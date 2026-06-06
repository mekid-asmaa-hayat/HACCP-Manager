import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ControlStatus } from '../control.entity';
import { CreateControlDto } from './create-control.dto';

export class UpdateControlDto extends PartialType(CreateControlDto) {
  @IsOptional()
  @IsEnum(ControlStatus)
  status?: ControlStatus;

  @IsOptional()
  @IsString()
  correctionAction?: string;
}
