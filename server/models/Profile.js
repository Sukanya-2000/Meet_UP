import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['man', 'woman', 'non-binary', 'other'],
    required: true,
  },
  lookingFor: {
    type: String,
    enum: ['man', 'woman', 'everyone'],
    required: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  interests: [{
    type: String,
    enum: ['Coffee', 'Travel', 'Fitness', 'Movies', 'Music', 'Books', 'Photography', 'Gaming'],
  }],
  openTo: [{
    type: String,
    trim: true,
    maxlength: 40,
  }],
  languages: [{
    type: String,
    trim: true,
    maxlength: 40,
  }],
  zodiac: {
    type: String,
    enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', ''],
    default: '',
  },
  education: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  familyPlans: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  communicationStyle: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  loveStyle: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  pets: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  drinking: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  smoking: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  workout: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  socialMedia: {
    type: String,
    trim: true,
    maxlength: 80,
    default: '',
  },
  astrology: {
    sun: { type: String, default: '' },
    moon: { type: String, default: '' },
    rising: { type: String, default: '' },
    birthTime: { type: String, default: '' },
    birthPlace: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  music: {
    anthem: { type: String, trim: true, maxlength: 120, default: '' },
    topArtists: [{ type: String, trim: true, maxlength: 80 }],
    topGenres: [{ type: String, trim: true, maxlength: 60 }],
    provider: { type: String, enum: ['manual', 'spotify', ''], default: 'manual' },
    connectedAt: { type: Date, default: null },
  },
  modeEligibility: {
    doubleDate: { type: Boolean, default: true, index: true },
    matchmaker: { type: Boolean, default: true, index: true },
    shareDate: { type: Boolean, default: true, index: true },
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  boostedUntil: {
    type: Date,
    default: null,
    index: true,
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 40,
  },
  trustSignals: {
    emailEstablished: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    hasPhotos: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    cleanStanding: { type: Boolean, default: true },
  },
}, { timestamps: true });

profileSchema.index({ gender: 1, dob: 1, isVerified: 1 });
profileSchema.index({ boostedUntil: -1, updatedAt: -1 });
profileSchema.index({ createdAt: -1 });
profileSchema.index({ interests: 1 });
profileSchema.index({ zodiac: 1 });
profileSchema.index({ 'music.topArtists': 1 });
profileSchema.index({ 'music.topGenres': 1 });

export default mongoose.model('Profile', profileSchema);
