import mongoose, { Schema } from 'mongoose';
import { IPromoCode } from '../types/index.js';

const promoCodeSchema = new Schema<IPromoCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  caseId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used'],
    default: 'active'
  },
  usedBy: {
    type: String,
    ref: 'User'
  },
  usedAt: {
    type: Date
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  expiresAt: {
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
