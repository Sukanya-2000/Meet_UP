import mongoose from 'mongoose';

const doubleDateGroupSchema = new mongoose.Schema({
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  memberUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused'],
    default: 'draft',
    index: true,
  },
  preferences: {
    ageMin: { type: Number, min: 18, max: 100, default: 18 },
    ageMax: { type: Number, min: 18, max: 100, default: 60 },
    genderPreference: { type: String, enum: ['man', 'woman', 'everyone'], default: 'everyone' },
  },
}, { timestamps: true });

doubleDateGroupSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.model('DoubleDateGroup', doubleDateGroupSchema);
