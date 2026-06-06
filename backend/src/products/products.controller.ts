import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des produits' })
  findAll() {
    return this.productsService.findAllProducts();
  }

  @Get('lots')
  @ApiOperation({ summary: 'Liste des lots' })
  findLots() {
    return this.productsService.findAllLots();
  }

  @Get('lots/expiring')
  @ApiOperation({ summary: 'Lots expirant dans les 3 prochains jours' })
  expiring() {
    return this.productsService.getExpiringLots(3);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import produits depuis CSV' })
  importCsv(@Body() body: { csv: string }) {
    return this.productsService.importFromCsv(body.csv);
  }
}
