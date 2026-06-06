import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ControlsService } from './controls.service';
import { CreateControlDto } from './dto/create-control.dto';
import { UpdateControlDto } from './dto/update-control.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ControlStatus, ControlType } from './control.entity';

@ApiTags('controls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('controls')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau contrôle HACCP' })
  create(@Body() dto: CreateControlDto, @Request() req) {
    return this.controlsService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les contrôles avec filtres et pagination' })
  @ApiQuery({ name: 'type', enum: ControlType, required: false })
  @ApiQuery({ name: 'status', enum: ControlStatus, required: false })
  @ApiQuery({ name: 'zone', required: false })
  @ApiQuery({ name: 'from', type: Date, required: false })
  @ApiQuery({ name: 'to', type: Date, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  findAll(@Query() query) {
    return this.controlsService.findAll(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Indicateurs clés pour le dashboard' })
  getDashboard() {
    return this.controlsService.getDashboardStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un contrôle' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.controlsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un contrôle (correction, statut)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateControlDto,
    @Request() req,
  ) {
    return this.controlsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un contrôle (ADMIN uniquement)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.controlsService.remove(id);
  }
}
