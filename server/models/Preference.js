import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  ageMin: {
    type: Number,
    min: 18,
    max: 100,
    default: 18,
  },
  ageMax: {
    type: Number,
    min: 18,
    max: 100,
    default: 60,
  },
  distanceKm: {
    type: Number,
    min: 1,
    max: 500,
    default: 50,
  },
  genderPreference: {
    type: String,
    enum: ['man', 'woman', 'everyone'],
    default: 'everyone',
  },
}, { timestamps: true });

export default mongoose.model('Preference', preferenceSchema);
