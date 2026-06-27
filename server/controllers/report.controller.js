import Report from '../models/Report.js';

export const createReport = async (req, res) => {
  const { reportedUserId, reason, details = '' } = req.body;
  if (String(reportedUserId) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot report your own account');
  }
  const report = await Report.create({ reporterId: req.user._id, reportedUserId, reason, details });
  res.status(201).json({ success: true, message: 'Report submitted', report });
};
