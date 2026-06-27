import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  isMain: {
    type: Boolean,
    default: false,
  },
  orderIndex: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

photoSchema.index({ userId: 1, orderIndex: 1 });

export default mongoose.model('Photo', photoSchema);
