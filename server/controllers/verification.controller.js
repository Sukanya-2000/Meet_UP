import VerificationRequest from '../models/VerificationRequest.js';

export const createVerification = async (req, res) => {
  const existing = await VerificationRequest.findOne({ userId: req.user._id, status: 'pending' });
  if (existing) {
    res.status(409);
    throw new Error('A verification request is already pending');
  }
  const request = await VerificationRequest.create({
    userId: req.user._id,
    documentUrl: req.body.documentUrl || '',
  });
  res.status(201).json({ success: true, message: 'Verification request submitted', request });
};
