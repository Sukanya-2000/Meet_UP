import mongoose from 'mongoose';
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, push: { type: Boolean, default: true }, email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true }, matches: { type: Boolean, default: true }, messages: { type: Boolean, default: true }, likes: { type: Boolean, default: true }, safety: { type: Boolean, default: true }, marketing: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model('NotificationPreference', schema);
