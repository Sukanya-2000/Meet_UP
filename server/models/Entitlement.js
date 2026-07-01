import mongoose from 'mongoose';
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, key: { type: String, required: true }, source: { type: String, enum: ['stripe','apple','google','admin'], required: true }, active: { type: Boolean, default: true }, expiresAt: { type: Date, default: null }, metadata: { type: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true }); schema.index({ userId: 1, key: 1, source: 1 }, { unique: true });
export default mongoose.model('Entitlement', schema);
