import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Control, ControlStatus, ControlType } from './control.entity';
import { CreateControlDto } from './dto/create-control.dto';
import { UpdateControlDto } from './dto/update-control.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class ControlsService {
  constructor(
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
  ) {}

  async create(dto: CreateControlDto, user: User): Promise<Control> {
    const control = this.controlRepo.create({
      ...dto,
      createdBy: user,
      // Détermination automatique du statut selon les seuils
      status: this.computeStatus(dto),
    });
    return this.controlRepo.save(control);
  }

  async findAll(filters: {
    type?: ControlType;
    status?: ControlStatus;
    zone?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, from, to, ...rest } = filters;
    const where: FindOptionsWhere<Control> = { ...rest } as FindOptionsWhere<Control>;

    if (from && to) {
      where.controlledAt = Between(from, to);
    }

    const [data, total] = await this.controlRepo.findAndCount({
      where,
      order: { controlledAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Control> {
    const control = await this.controlRepo.findOne({ where: { id } });
    if (!control) throw new NotFoundException(`Contrôle #${id} introuvable`);
    return control;
  }

  async update(id: string, dto: UpdateControlDto, user: User): Promise<Control> {
    const control = await this.findOne(id);
    // Seul l'admin ou l'auteur peut modifier
    if (user.role !== UserRole.ADMIN && control.createdBy.id !== user.id) {
      throw new ForbiddenException('Action non autorisée');
    }
    Object.assign(control, dto);
    return this.controlRepo.save(control);
  }

  async remove(id: string): Promise<void> {
    const control = await this.findOne(id);
    await this.controlRepo.remove(control);
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, nonConformes, today_count, conformes] = await Promise.all([
      this.controlRepo.count(),
      this.controlRepo.count({ where: { status: ControlStatus.NON_CONFORME } }),
      this.controlRepo.count({
        where: { controlledAt: Between(today, tomorrow) },
      }),
      this.controlRepo.count({ where: { status: ControlStatus.CONFORME } }),
    ]);

    const conformiteRate = total > 0 ? Math.round((conformes / total) * 100) : 0;

    return {
      totalControls: total,
      nonConformes,
      todayControls: today_count,
      conformiteRate,
      alertesActives: nonConformes,
    };
  }

  private computeStatus(dto: CreateControlDto): ControlStatus {
    if (dto.temperature !== undefined && dto.temperature !== null) {
      const max = dto.thresholdMax ?? 4;
      const min = dto.thresholdMin ?? -18;
      if (dto.temperature > max || dto.temperature < min) {
        return ControlStatus.NON_CONFORME;
      }
      return ControlStatus.CONFORME;
    }
    return ControlStatus.EN_ATTENTE;
  }
}
