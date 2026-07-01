import mongoose from 'mongoose';
const schema = new mongoose.Schema({ matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, index: true }, actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, type: { type: String, enum: ['created','expired','extended','rematched','unmatched','restored'], required: true }, metadata: { type: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true }); schema.index({ matchId: 1, createdAt: -1 });
export default mongoose.model('MatchLifecycleEvent', schema);
