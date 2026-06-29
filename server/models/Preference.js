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
  minimumPhotos: {
    type: Number,
    min: 0,
    max: 6,
    default: 0,
  },
  hasBio: {
    type: Boolean,
    default: false,
  },
  expandDistance: {
    type: Boolean,
    default: false,
  },
  expandAgeRange: {
    type: Boolean,
    default: false,
  },
  interests: [{ type: String, trim: true }],
  lookingFor: [{ type: String, trim: true }],
  openTo: [{ type: String, trim: true }],
  languages: [{ type: String, trim: true }],
  zodiac: [{ type: String, trim: true }],
  education: [{ type: String, trim: true }],
  familyPlans: [{ type: String, trim: true }],
  communicationStyle: [{ type: String, trim: true }],
  loveStyle: [{ type: String, trim: true }],
  pets: [{ type: String, trim: true }],
  drinking: [{ type: String, trim: true }],
  smoking: [{ type: String, trim: true }],
  workout: [{ type: String, trim: true }],
  socialMedia: [{ type: String, trim: true }],
  genderPreference: {
    type: String,
    enum: ['man', 'woman', 'everyone'],
    default: 'everyone',
  },
}, { timestamps: true });

preferenceSchema.index({ genderPreference: 1, ageMin: 1, ageMax: 1 });

export default mongoose.model('Preference', preferenceSchema);
