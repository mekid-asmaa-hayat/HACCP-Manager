import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Control } from '../controls/control.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  QUALITE = 'QUALITE',
  OPERATEUR = 'OPERATEUR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OPERATEUR })
  role: UserRole;

  @Column({ nullable: true })
  etablissement: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @OneToMany(() => Control, (control) => control.createdBy)
  controls: Control[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
