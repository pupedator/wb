import mongoose, { Schema } from 'mongoose';
import { ICaseHistory } from '../types/index.js';

const caseHistorySchema = new Schema<ICaseHistory>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  rewardName: {
    type: String,
    required: true
  },
  rewardRarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'legendary'],
    required: true
  },
  rewardImage: {
    type: String,
    required: true
  },
  caseName: {
    type: String,
    required: true
  },
  caseId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
caseHistorySchema.index({ userId: 1, createdAt: -1 });
caseHistorySchema.index({ caseId: 1 });

// Transform output to match frontend expectations
caseHistorySchema.methods.toJSON = function() {
  const historyObject = this.toObject();
  historyObject.id = historyObject._id.toString();
  historyObject.date = historyObject.createdAt.toISOString();
  delete historyObject._id;
  delete historyObject.__v;
  delete historyObject.updatedAt;
  return historyObject;
};

export const CaseHistory = mongoose.model<ICaseHistory>('CaseHistory', caseHistorySchema);
export default CaseHistory;
