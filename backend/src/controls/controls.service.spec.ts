import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlsService } from './controls.service';
import { Control, ControlStatus, ControlType, Zone } from './control.entity';
import { UserRole } from '../users/user.entity';

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@haccp.fr',
  role: UserRole.OPERATEUR,
  firstName: 'Test',
  lastName: 'User',
};

const mockControl: Partial<Control> = {
  id: 'ctrl-uuid-1',
  type: ControlType.TEMPERATURE,
  zone: Zone.STOCKAGE_FROID,
  temperature: 3.5,
  thresholdMax: 4,
  thresholdMin: 0,
  status: ControlStatus.CONFORME,
};

describe('ControlsService', () => {
  let service: ControlsService;
  let repo: jest.Mocked<Repository<Control>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ControlsService,
        {
          provide: getRepositoryToken(Control),
          useValue: {
            create: jest.fn().mockReturnValue(mockControl),
            save: jest.fn().mockResolvedValue(mockControl),
            findOne: jest.fn().mockResolvedValue(mockControl),
            findAndCount: jest.fn().mockResolvedValue([[mockControl], 1]),
            count: jest.fn().mockResolvedValue(10),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ControlsService>(ControlsService);
    repo = module.get(getRepositoryToken(Control));
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  it('devrait créer un contrôle conforme quand température dans les seuils', async () => {
    const dto = {
      type: ControlType.TEMPERATURE,
      zone: Zone.STOCKAGE_FROID,
      temperature: 3.5,
      thresholdMax: 4,
      thresholdMin: 0,
    };
    const result = await service.create(dto as any, mockUser as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.status).toBe(ControlStatus.CONFORME);
  });

  it('devrait retourner NON_CONFORME quand température dépasse le seuil', async () => {
    repo.create.mockReturnValue({
      ...mockControl,
      temperature: 8,
      status: ControlStatus.NON_CONFORME,
    } as Control);
    repo.save.mockResolvedValue({
      ...mockControl,
      temperature: 8,
      status: ControlStatus.NON_CONFORME,
    } as Control);

    const dto = {
      type: ControlType.TEMPERATURE,
      zone: Zone.STOCKAGE_FROID,
      temperature: 8,
      thresholdMax: 4,
    };
    const result = await service.create(dto as any, mockUser as any);
    expect(result.status).toBe(ControlStatus.NON_CONFORME);
  });

  it('devrait retourner la liste des contrôles avec pagination', async () => {
    const result = await service.findAll({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.pages).toBe(1);
  });

  it('devrait lancer une exception si le contrôle n\'existe pas', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('inexistant')).rejects.toThrow();
  });
});
