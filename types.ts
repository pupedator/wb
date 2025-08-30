// --- Type Definitions for the Application ---
// This file centralizes all the custom TypeScript types used across the project.
// This makes it easier to manage and reuse data structures.

/**
 * Represents a single game available at the cyber cafe.
 */
export interface Game {
  id: string;
  title: string;
  image: string;
}

/**
 * Represents a single Frequently Asked Question item.
 */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Defines the structure for a Resident membership plan.
 */
export interface ResidentPlan {
    title: string;
    topUpLabel: string;
    topUpAmount: string;
    features: {
        name: string;
        value: string | boolean; // Can be a string (e.g., '5%') or a boolean for check/cross marks.
        type: 'string' | 'boolean';
    }[];
}

/**
 * Represents a general pricing plan (e.g., hourly rates).
 */
export interface PricingPlan {
  name:string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean; // Optional flag to make a plan stand out visually.
}

/**
 * Represents a hardware specification for the PCs.
 */
export interface Spec {
  id: string;
  icon: string; // Typically an SVG string.
  name: string;
  value: string;
}

/**
 * Represents an image in the photo gallery.
 */
export interface GalleryImage {
  id: string;
  src: string; // URL of the image.
  span?: number; // Optional property for grid layout (e.g., col-span-2).
}

/**
 * Represents a potential reward that can be won from a case.
 */
export interface Reward {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  image: string;
}

/**
 * Extends the base Reward with properties specific to being inside a case.
 */
export interface CaseReward extends Reward {
  id: string;
  chance: number; // The drop chance percentage (e.g., 5 for 5%).
}

/**
 * Defines the structure of a reward case that users can open.
 */
export interface Case {
  id: string;
  name: string;
  price: string; // Promo code required for all cases
  image: string;
  rewards: CaseReward[]; // An array of possible rewards.
}

/**
 * Represents an item in a user's case opening history.
 */
export interface CaseHistoryItem {
  rewardName: string;
  rewardRarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  rewardImage: string;
  caseName: string;
  date: string; // ISO date string.
}

/**
 * Represents the profile of a user.
 */
export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // URL to the avatar image.
  email: string;
  role: 'user' | 'admin';
  registrationDate?: string; // ISO date string.
  password?: string; // Stored in mock DB (localStorage), not for frontend display.
  status?: 'active' | 'banned';
}

/**
 * Represents a promo code for unlocking cases.
 */
export interface PromoCode {
  id?: string;
  code: string;
  caseId: string; // The ID of the case this code unlocks.
  caseName?: string; // Name of the case (populated by backend)
  status: 'active' | 'used' | 'expired';
  createdAt: string; // ISO date string.
  expiresAt?: string; // ISO date string.
  usedBy?: string; // User ID who used the code
  usedAt?: string; // ISO date string when used
  createdBy: string; // Admin user ID who created the code
  usageAttempts?: number; // Number of failed usage attempts
  lastAttemptAt?: string; // ISO date string of last attempt
}
