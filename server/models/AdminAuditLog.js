import mongoose from 'mongoose';
const schema = new mongoose.Schema({ actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, action: { type: String, required: true, index: true }, targetType: { type: String, required: true }, targetId: { type: String, required: true }, before: { type: mongoose.Schema.Types.Mixed, default: null }, after: { type: mongoose.Schema.Types.Mixed, default: null }, ipAddress: { type: String, default: '' } }, { timestamps: true });
schema.index({ createdAt: -1, action: 1 }); export default mongoose.model('AdminAuditLog', schema);
