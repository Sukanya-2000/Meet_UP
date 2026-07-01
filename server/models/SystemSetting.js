import mongoose from 'mongoose';
const schema = new mongoose.Schema({ key: { type: String, required: true, unique: true }, value: { type: mongoose.Schema.Types.Mixed, required: true }, description: { type: String, maxlength: 500, default: '' }, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } }, { timestamps: true });
export default mongoose.model('SystemSetting', schema);
