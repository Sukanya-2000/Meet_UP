import mongoose from 'mongoose';
const schema = new mongoose.Schema({ text: { type: String, required: true, trim: true, maxlength: 400 }, category: { type: String, required: true, trim: true, index: true }, difficulty: { type: String, enum: ['easy','medium','deep'], default: 'easy' }, orderIndex: { type: Number, default: 0 }, available: { type: Boolean, default: true, index: true } }, { timestamps: true });
export default mongoose.model('GameQuestion', schema);
