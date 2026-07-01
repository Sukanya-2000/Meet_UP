import mongoose from 'mongoose';
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, key: { type: String, enum: ['super-like','pre-match-note','boost'], required: true }, balance: { type: Number, min: 0, default: 0 }, dailyUsed: { type: Number, min: 0, default: 0 }, dailyWindow: { type: String, default: '' } }, { timestamps: true }); schema.index({ userId: 1, key: 1 }, { unique: true });
export default mongoose.model('ConsumableBalance', schema);
