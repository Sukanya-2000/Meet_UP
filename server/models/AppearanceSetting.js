import mongoose from 'mongoose';

const appearanceSettingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
  accentColor: { type: String, enum: ['coral', 'rose', 'violet', 'blue', 'emerald', 'amber'], default: 'coral' },
  fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  textScale: { type: Number, min: 0.8, max: 1.5, default: 1 },
  reducedMotion: { type: Boolean, default: false },
  highContrast: { type: Boolean, default: false },
  rtlPreview: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('AppearanceSetting', appearanceSettingSchema);
