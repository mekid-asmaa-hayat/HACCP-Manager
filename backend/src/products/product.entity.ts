import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';

export enum ProductCategory {
  VIANDE = 'VIANDE',
  POISSON = 'POISSON',
  PRODUIT_LAITIER = 'PRODUIT_LAITIER',
  LEGUME = 'LEGUME',
  SURGELE = 'SURGELE',
  EPICERIE = 'EPICERIE',
  BOISSON = 'BOISSON',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'float', nullable: true, comment: 'Température de stockage max (°C)' })
  storageTemperatureMax: number;

  @Column({ type: 'float', nullable: true, comment: 'Température de stockage min (°C)' })
  storageTemperatureMin: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ── Lot ──────────────────────────────────────────────────────────────────────

export enum LotStatus {
  EN_STOCK = 'EN_STOCK',
  UTILISE = 'UTILISE',
  PERIME = 'PERIME',
  RETIRE = 'RETIRE',
}

@Entity('lots')
export class Lot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lotNumber: string;

  @Column()
  productId: string;

  @Column({ type: 'date' })
  receptionDate: Date;

  @Column({ type: 'date' })
  dlcDate: Date;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'enum', enum: LotStatus, default: LotStatus.EN_STOCK })
  status: LotStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
