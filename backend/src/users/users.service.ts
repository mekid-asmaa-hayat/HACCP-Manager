import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    return user;
  }

  async create(data: {
    email: string; firstName: string; lastName: string;
    password: string; role?: UserRole; etablissement?: string;
  }) {
    const exists = await this.userRepo.findOne({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email déjà utilisé');
    const hashed = await bcrypt.hash(data.password, 12);
    const user = this.userRepo.create({ ...data, password: hashed });
    return this.userRepo.save(user);
  }

  async completeOnboarding(id: string) {
    const user = await this.findOne(id);
    user.onboardingCompleted = true;
    return this.userRepo.save(user);
  }

  async seedDemoUsers() {
    const count = await this.userRepo.count();
    if (count > 0) return;

    const demos = [
      { email: 'admin@haccp.fr', firstName: 'Admin', lastName: 'HACCPManager', password: 'Admin1234!', role: UserRole.ADMIN, etablissement: 'Siège' },
      { email: 'qualite@haccp.fr', firstName: 'Sophie', lastName: 'Dupont', password: 'Qualite1234!', role: UserRole.QUALITE, etablissement: 'Restaurant Central' },
      { email: 'operateur@haccp.fr', firstName: 'Marc', lastName: 'Bernard', password: 'Operateur1234!', role: UserRole.OPERATEUR, etablissement: 'Restaurant Central' },
    ];

    for (const u of demos) {
      await this.create(u);
    }
    console.log('✅ Utilisateurs de démo créés');
  }
}
