// types/index.ts — Types TypeScript partagés HACCPManager

export type UserRole = 'ADMIN' | 'QUALITE' | 'OPERATEUR';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  etablissement?: string;
  onboardingCompleted: boolean;
}

export type ControlType = 'TEMPERATURE' | 'HYGIENE' | 'EQUIPMENT' | 'DLC' | 'RECEPTION';
export type ControlStatus = 'CONFORME' | 'NON_CONFORME' | 'EN_ATTENTE' | 'CORRIGE';
export type Zone = 'CUISINE' | 'STOCKAGE_FROID' | 'STOCKAGE_SEC' | 'RECEPTION' | 'SALLE';

export interface Control {
  id: string;
  type: ControlType;
  zone: Zone;
  temperature?: number;
  thresholdMin?: number;
  thresholdMax?: number;
  equipmentName?: string;
  dlcDate?: string;
  productName?: string;
  notes?: string;
  status: ControlStatus;
  correctionAction?: string;
  createdBy: User;
  controlledAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardStats {
  totalControls: number;
  nonConformes: number;
  alertesActives: number;
  todayControls: number;
  conformiteRate: number;
  conformiteByDay: { day: string; conformite: number; total: number }[];
}

export type ProductCategory =
  | 'VIANDE' | 'POISSON' | 'PRODUIT_LAITIER' | 'LEGUME'
  | 'SURGELE' | 'EPICERIE' | 'BOISSON';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  supplier?: string;
  reference?: string;
  storageTemperatureMax?: number;
  storageTemperatureMin?: number;
  isActive: boolean;
}

export interface Lot {
  id: string;
  lotNumber: string;
  productId: string;
  receptionDate: string;
  dlcDate: string;
  quantity: number;
  unit?: string;
  status: 'EN_STOCK' | 'UTILISE' | 'PERIME' | 'RETIRE';
  notes?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ImportResult {
  imported: number;
  errors: { line: number; message: string }[];
}
