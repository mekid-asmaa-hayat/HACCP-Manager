import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Lot, LotStatus } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Lot) private readonly lotRepo: Repository<Lot>,
  ) {}

  findAllProducts() {
    return this.productRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  findAllLots() {
    return this.lotRepo.find({ order: { receptionDate: 'DESC' } });
  }

  async getExpiringLots(daysAhead = 3): Promise<Lot[]> {
    const limit = new Date();
    limit.setDate(limit.getDate() + daysAhead);
    const lots = await this.lotRepo.find({ where: { status: LotStatus.EN_STOCK } });
    return lots.filter((l) => new Date(l.dlcDate) <= limit);
  }

  /**
   * Import en masse depuis CSV
   * Format attendu : name,category,supplier,reference,storageTemperatureMax,storageTemperatureMin
   */
  async importFromCsv(csvContent: string): Promise<{
    imported: number;
    errors: { line: number; message: string }[];
  }> {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const errors: { line: number; message: string }[] = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => (row[h] = values[idx] || ''));

      try {
        if (!row['name']) throw new Error('Champ "name" manquant');
        if (!row['category']) throw new Error('Champ "category" manquant');

        const product = this.productRepo.create({
          name: row['name'],
          category: row['category'] as any,
          supplier: row['supplier'],
          reference: row['reference'],
          storageTemperatureMax: row['storagetemperaturemax']
            ? parseFloat(row['storagetemperaturemax']) : null,
          storageTemperatureMin: row['storagetemperaturemin']
            ? parseFloat(row['storagetemperaturemin']) : null,
        });

        await this.productRepo.save(product);
        imported++;
      } catch (e) {
        errors.push({ line: i + 1, message: e.message });
      }
    }

    return { imported, errors };
  }
}
