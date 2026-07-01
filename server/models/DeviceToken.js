import mongoose from 'mongoose';
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, token: { type: String, required: true, unique: true }, platform: { type: String, enum: ['ios','android','web'], required: true }, enabled: { type: Boolean, default: true }, lastSeenAt: { type: Date, default: Date.now } }, { timestamps: true });
export default mongoose.model('DeviceToken', schema);
