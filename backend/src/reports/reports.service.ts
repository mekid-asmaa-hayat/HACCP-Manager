import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Control, ControlStatus } from '../controls/control.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
  ) {}

  async generateDailyPdf(date: Date): Promise<Buffer> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const controls = await this.controlRepo.find({
      where: { controlledAt: Between(start, end) },
      order: { controlledAt: 'ASC' },
    });

    const conformes = controls.filter((c) => c.status === ControlStatus.CONFORME).length;
    const nonConformes = controls.filter((c) => c.status === ControlStatus.NON_CONFORME).length;
    const tauxConformite = controls.length > 0
      ? Math.round((conformes / controls.length) * 100) : 0;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // En-tête
      doc.fontSize(20).fillColor('#2E75B6').text('HACCPManager', { align: 'center' });
      doc.fontSize(14).fillColor('#333').text(
        `Rapport de conformité HACCP — ${date.toLocaleDateString('fr-FR')}`,
        { align: 'center' },
      );
      doc.moveDown();

      // Généré le
      doc.fontSize(10).fillColor('#666')
        .text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, { align: 'right' });
      doc.moveDown();

      // Résumé
      doc.fontSize(13).fillColor('#2E75B6').text('Résumé');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2E75B6');
      doc.moveDown(0.5);

      doc.fontSize(11).fillColor('#333');
      doc.text(`Total contrôles : ${controls.length}`);
      doc.text(`Conformes : ${conformes}`, { continued: true });
      doc.fillColor(tauxConformite >= 80 ? 'green' : 'red')
        .text(`  (${tauxConformite}% conformité)`);
      doc.fillColor('#333').text(`Non conformes : ${nonConformes}`);
      doc.moveDown();

      // Tableau des contrôles
      doc.fontSize(13).fillColor('#2E75B6').text('Détail des contrôles');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2E75B6');
      doc.moveDown(0.5);

      controls.forEach((c, i) => {
        if (doc.y > 700) doc.addPage();

        const statusColor = c.status === ControlStatus.CONFORME ? 'green'
          : c.status === ControlStatus.NON_CONFORME ? 'red' : 'orange';

        doc.fontSize(10).fillColor('#333')
          .text(`${i + 1}. [${c.type}] ${c.zone}`, { continued: true })
          .fillColor(statusColor).text(`  ● ${c.status}`);

        if (c.temperature !== null) {
          doc.fillColor('#555').fontSize(9)
            .text(`   Température : ${c.temperature}°C`);
        }
        if (c.productName) {
          doc.fillColor('#555').fontSize(9).text(`   Produit : ${c.productName}`);
        }
        if (c.notes) {
          doc.fillColor('#888').fontSize(9).text(`   Note : ${c.notes}`);
        }
        doc.moveDown(0.3);
      });

      // Signature
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#999')
        .text('Document généré automatiquement par HACCPManager', { align: 'center' });

      doc.end();
    });
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, nonConformes, todayControls, weekControls] = await Promise.all([
      this.controlRepo.count(),
      this.controlRepo.count({ where: { status: ControlStatus.NON_CONFORME } }),
      this.controlRepo.count({ where: { controlledAt: Between(today, new Date()) } }),
      this.controlRepo.find({ where: { controlledAt: Between(weekAgo, new Date()) } }),
    ]);

    // Taux de conformité par jour sur 7 jours
    const conformiteByDay = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(day.getDate() - (6 - i));
      const dayStr = day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      const dayControls = weekControls.filter((c) => {
        const d = new Date(c.controlledAt);
        return d.toDateString() === day.toDateString();
      });
      const conf = dayControls.filter((c) => c.status === ControlStatus.CONFORME).length;
      return {
        day: dayStr,
        conformite: dayControls.length > 0 ? Math.round((conf / dayControls.length) * 100) : 0,
        total: dayControls.length,
      };
    });

    return {
      totalControls: total,
      nonConformes,
      alertesActives: nonConformes,
      todayControls,
      conformiteRate: total > 0
        ? Math.round(((total - nonConformes) / total) * 100) : 0,
      conformiteByDay,
    };
  }
}
