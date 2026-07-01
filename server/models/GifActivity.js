import mongoose from 'mongoose';
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, gifId: { type: String, required: true }, url: { type: String, required: true, maxlength: 500 }, title: { type: String, maxlength: 200, default: '' }, favorite: { type: Boolean, default: false }, lastUsedAt: { type: Date, default: Date.now } }, { timestamps: true }); schema.index({ userId: 1, gifId: 1 }, { unique: true }); schema.index({ userId: 1, lastUsedAt: -1 });
export default mongoose.model('GifActivity', schema);
