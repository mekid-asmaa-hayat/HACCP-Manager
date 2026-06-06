import {
  IsEnum, IsOptional, IsNumber, IsString, IsDateString, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ControlType, Zone } from '../control.entity';

export class CreateControlDto {
  @ApiProperty({ enum: ControlType, example: ControlType.TEMPERATURE })
  @IsEnum(ControlType)
  type: ControlType;

  @ApiProperty({ enum: Zone, example: Zone.STOCKAGE_FROID })
  @IsEnum(Zone)
  zone: Zone;

  @ApiPropertyOptional({ example: 3.5, description: 'Température mesurée en °C' })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(100)
  temperature?: number;

  @ApiPropertyOptional({ example: -18, description: 'Seuil minimum acceptable (°C)' })
  @IsOptional()
  @IsNumber()
  thresholdMin?: number;

  @ApiPropertyOptional({ example: 4, description: 'Seuil maximum acceptable (°C)' })
  @IsOptional()
  @IsNumber()
  thresholdMax?: number;

  @ApiPropertyOptional({ example: 'Réfrigérateur n°3' })
  @IsOptional()
  @IsString()
  equipmentName?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dlcDate?: Date;

  @ApiPropertyOptional({ example: 'Filet de saumon' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ example: 'Température mesurée à 6h00' })
  @IsOptional()
  @IsString()
  notes?: string;
}
