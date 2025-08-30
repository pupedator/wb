import { Request } from 'express';
import { Document } from 'mongoose';

// --- Base Types (matching frontend) ---

export interface Game {
  id: string;
  title: string;
  image: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ResidentPlan {
  title: string;
  topUpLabel: string;
  topUpAmount: string;
  features: {
    name: string;
    value: string | boolean;
    type: 'string' | 'boolean';
  }[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
}

export interface Spec {
  id: string;
  icon: string;
  name: string;
  value: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  span?: number;
}

export interface Reward {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  image: string;
}

export interface CaseReward extends Reward {
  id: string;
  chance: number;
}

export interface Case {
  id: string;
  name: string;
  price: string;
  image: string;
  rewards: CaseReward[];
}

// --- Database Document Interfaces ---

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  registrationDate: Date;
  lastLogin?: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICaseHistory extends Document {
  _id: string;
  userId: string;
  rewardName: string;
  rewardRarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  rewardImage: string;
  caseName: string;
  caseId: string;
  createdAt: Date;
}

export interface IPromoCode extends Document {
  _id: string;
  code: string;
  caseId: string;
  status: 'active' | 'used' | 'expired';
  usedBy?: string; // User ID who used the code
  usedAt?: Date;
  createdBy: string; // Admin user ID who created the code
  createdAt: Date;
  expiresAt?: Date;
  usageAttempts: number; // Track failed usage attempts
  lastAttemptAt?: Date; // Last usage attempt timestamp
  isValid(): boolean;
}

export interface IOTP extends Document {
  _id: string;
  email: string;
  otp: string;
  type: 'registration' | 'password_reset';
  expiresAt: Date;
  userData?: {
    name?: string;
    password?: string;
  };
  createdAt: Date;
  isValid(): boolean;
}

// --- API Request/Response Types ---

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest extends OTPRequest {
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'user' | 'admin';
    status: 'active' | 'banned';
  };
}

export interface CaseOpenRequest {
  caseId: string;
  promoCode?: string;
}

export interface CaseOpenResponse {
  success: boolean;
  message?: string;
  reward?: {
    name: string;
    rarity: string;
    image: string;
  };
}

export interface PromoCodeRequest {
  caseId: string;
}

export interface PromoCodeResponse {
  success: boolean;
  message?: string;
  code?: string;
}

// --- Error Types ---

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class CustomError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    if (code) this.code = code;
  }
}
