import mongoose, { Schema } from 'mongoose';
import { IOTP } from '../types/index.js';

const otpSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  userData: {
    name: { type: String },
    password: { type: String }
  }
}, {
  timestamps: true
});

// Index for efficient queries and automatic cleanup
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL index for automatic cleanup

// Check if OTP is valid (not expired)
otpSchema.methods.isValid = function(): boolean {
  return new Date() < this.expiresAt;
};

// Transform output
otpSchema.methods.toJSON = function() {
  const otpObject = this.toObject();
  delete otpObject._id;
  delete otpObject.__v;
  return otpObject;
};

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
export default OTP;
