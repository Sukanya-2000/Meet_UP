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

export default mongoose.model('Profile', profileSchema);
