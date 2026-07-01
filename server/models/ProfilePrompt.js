import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['about-me','values','dating','lifestyle','fun'], required: true },
  prompt: { type: String, required: true, trim: true, maxlength: 160 }, answer: { type: String, required: true, trim: true, maxlength: 500 },
  photoUrl: { type: String, trim: true, maxlength: 500, default: '' }, orderIndex: { type: Number, min: 0, max: 2, required: true },
  moderationStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true }, moderationNote: { type: String, maxlength: 500, default: '' },
}, { timestamps: true });
schema.index({ userId: 1, orderIndex: 1 }, { unique: true });
export default mongoose.model('ProfilePrompt', schema);
