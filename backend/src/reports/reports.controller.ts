import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Indicateurs dashboard' })
  getDashboard() {
    return this.reportsService.getDashboardStats();
  }

  @Get('daily')
  @ApiOperation({ summary: 'Rapport journalier PDF' })
  @ApiQuery({ name: 'date', example: '2024-06-01', required: false })
  async getDailyPdf(@Query('date') date: string, @Res() res: Response) {
    const reportDate = date ? new Date(date) : new Date();
    const buffer = await this.reportsService.generateDailyPdf(reportDate);
    const filename = `rapport-haccp-${reportDate.toISOString().split('T')[0]}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
