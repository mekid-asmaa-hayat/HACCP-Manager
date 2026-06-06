import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ControlType {
  TEMPERATURE = 'TEMPERATURE',
  HYGIENE = 'HYGIENE',
  EQUIPMENT = 'EQUIPMENT',
  DLC = 'DLC',
  RECEPTION = 'RECEPTION',
}

export enum ControlStatus {
  CONFORME = 'CONFORME',
  NON_CONFORME = 'NON_CONFORME',
  EN_ATTENTE = 'EN_ATTENTE',
  CORRIGE = 'CORRIGE',
}

export enum Zone {
  CUISINE = 'CUISINE',
  STOCKAGE_FROID = 'STOCKAGE_FROID',
  STOCKAGE_SEC = 'STOCKAGE_SEC',
  RECEPTION = 'RECEPTION',
  SALLE = 'SALLE',
}

@Entity('controls')
export class Control {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ControlType })
  type: ControlType;

  @Column({ type: 'enum', enum: Zone })
  zone: Zone;

  @Column({ type: 'float', nullable: true })
  temperature: number;

  @Column({ nullable: true })
  equipmentName: string;

  @Column({ type: 'date', nullable: true })
  dlcDate: Date;

  @Column({ nullable: true })
  productName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: ControlStatus, default: ControlStatus.EN_ATTENTE })
  status: ControlStatus;

  @Column({ nullable: true })
  correctionAction: string;

  @Column({ type: 'float', nullable: true })
  thresholdMin: number;

  @Column({ type: 'float', nullable: true })
  thresholdMax: number;

  @ManyToOne(() => User, (user) => user.controls, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn()
  controlledAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isTemperatureAlert(): boolean {
    if (this.type !== ControlType.TEMPERATURE || this.temperature === null) return false;
    if (this.thresholdMax !== null && this.temperature > this.thresholdMax) return true;
    if (this.thresholdMin !== null && this.temperature < this.thresholdMin) return true;
    return false;
  }
}
