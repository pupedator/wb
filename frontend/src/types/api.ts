// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  avatar?: string;
  bonusPoints: number;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserProfile extends User {
  _count?: {
    caseHistory: number;
    promoCodes: number;
  };
}

export interface UserSession {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Content Types
export type ContentType = 
  | 'GAME' 
  | 'PS5_GAME' 
  | 'PS4_GAME' 
  | 'SPEC' 
  | 'GALLERY_IMAGE' 
  | 'PLAYSTATION_IMAGE' 
  | 'PARTNER_LOGO';

export type Language = 'EN' | 'AZ' | 'RU';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  data: Record<string, any>;
  imageUrl?: string;
  isActive: boolean;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

// Case Types
export type RewardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

export interface CaseReward {
  id: string;
  name: string;
  rarity: RewardRarity;
  imageUrl: string;
  chance: number;
}

export interface Case {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  isActive: boolean;
  language: Language;
  createdAt: string;
  updatedAt: string;
  rewards: CaseReward[];
  _count?: {
    history: number;
  };
}

export interface CaseHistory {
  id: string;
  userId: string;
  caseId: string;
  rewardId: string;
  promoCode?: string;
  createdAt: string;
  case: {
    name: string;
    imageUrl: string;
    price?: string;
  };
  reward: {
    name: string;
    rarity: RewardRarity;
    imageUrl: string;
  };
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  caseId?: string;
  userId?: string;
  maxUses: number;
  currentUses: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  case?: {
    id: string;
    name: string;
    imageUrl: string;
    price?: string;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Admin Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  userStats: {
    total: number;
    active: number;
    admins: number;
    newThisWeek: number;
  };
  caseStats: {
    total: number;
    active: number;
    totalOpened: number;
    openedThisWeek: number;
  };
  promoStats: {
    total: number;
    active: number;
    used: number;
    expired: number;
  };
  contentStats: {
    total: number;
    active: number;
    byType: Record<string, number>;
  };
  recentActivity: AuditLog[];
}

export interface Analytics {
  userGrowth: Array<{ createdAt: string; _count: { id: number } }>;
  caseOpeningTrends: Array<{ createdAt: string; _count: { id: number } }>;
  rewardDistribution: Record<string, number>;
  promoCodeUsage: Array<{
    code: string;
    currentUses: number;
    maxUses: number;
    case?: { name: string };
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    bonusPoints: number;
    _count: { caseHistory: number };
  }>;
  systemHealth: {
    activeUsers: number;
    caseOpenings: number;
    adminActions: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateContentRequest {
  type: ContentType;
  title: string;
  data: Record<string, any>;
  imageUrl?: string;
  language?: Language;
  isActive?: boolean;
}

export interface CreateCaseRequest {
  name: string;
  price: string;
  imageUrl: string;
  language?: Language;
  isActive?: boolean;
}

export interface CreateRewardRequest {
  name: string;
  rarity: RewardRarity;
  imageUrl: string;
  chance: number;
}

export interface CreatePromoCodeRequest {
  code: string;
  caseId?: string;
  userId?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface OpenCaseRequest {
  caseId: string;
  promoCode?: string;
}

export interface ValidatePromoCodeRequest {
  code: string;
  caseId?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentFilters extends PaginationParams {
  type?: ContentType;
  language?: Language;
  isActive?: boolean;
}

export interface UserFilters extends PaginationParams {
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'BANNED' | 'PENDING';
}

export interface CaseFilters extends PaginationParams {
  language?: Language;
  isActive?: boolean;
}

export interface PromoCodeFilters extends PaginationParams {
  caseId?: string;
  userId?: string;
  isActive?: boolean;
  expired?: boolean;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  details?: any;
  stack?: string;
}

// Success Response Types
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponseType<T = any> = SuccessResponse<T> | ErrorResponse;
