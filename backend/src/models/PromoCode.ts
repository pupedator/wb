import mongoose, { Schema } from 'mongoose';
import { IPromoCode } from '../types/index.js';

const promoCodeSchema = new Schema<IPromoCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 50,
    validate: {
      validator: function(v: string) {
        // Ensure code contains only alphanumeric characters and hyphens
        return /^[A-Z0-9\-]+$/.test(v);
      },
      message: 'Promo code can only contain letters, numbers, and hyphens'
    }
  },
  caseId: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Ensure caseId is not empty and follows expected format
        return v && v.length > 0;
      },
      message: 'Case ID must be provided'
    }
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  usedBy: {
    type: String,
    ref: 'User',
    validate: {
      validator: function(v: string) {
        // Only validate if status is 'used'
        if (this.status === 'used') {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'Used by field is required when status is used'
    }
  },
  usedAt: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        // Only validate if status is 'used'
        if (this.status === 'used') {
          return v != null;
        }
        return true;
      },
      message: 'Used at date is required when status is used'
    }
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default to 24 hours from creation
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    },
    validate: {
      validator: function(v: Date) {
        // Expiration date must be in the future when creating
        if (this.isNew) {
          return v > new Date();
        }
        return true;
      },
      message: 'Expiration date must be in the future'
    }
  },
  // Track usage attempts for security
  usageAttempts: {
    type: Number,
    default: 0,
    max: 10 // Prevent brute force attempts
  },
  lastAttemptAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ caseId: 1, status: 1 });
promoCodeSchema.index({ createdBy: 1 });
promoCodeSchema.index({ expiresAt: 1 }, { sparse: true });

// Transform output to match frontend expectations
promoCodeSchema.methods.toJSON = function() {
  const promoObject = this.toObject();
  promoObject.id = promoObject._id.toString();
  delete promoObject._id;
  delete promoObject.__v;
  return promoObject;
};

// Check if promo code is valid (not expired and not used)
promoCodeSchema.methods.isValid = function(): boolean {
  if (this.status === 'used') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

export const PromoCode = mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);
export default PromoCode;
