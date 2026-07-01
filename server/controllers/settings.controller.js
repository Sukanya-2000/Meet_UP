import AppearanceSetting from '../models/AppearanceSetting.js';

const defaults = { theme: 'system', accentColor: 'coral', fontSize: 'medium', textScale: 1, reducedMotion: false, highContrast: false, rtlPreview: false };
export const getAppearance = async (req, res) => {
  const appearance = await AppearanceSetting.findOneAndUpdate(
    { userId: req.user._id }, { $setOnInsert: { userId: req.user._id, ...defaults } }, { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ success: true, appearance });
};
export const updateAppearance = async (req, res) => {
  const allowed = ['theme', 'accentColor', 'fontSize', 'textScale', 'reducedMotion', 'highContrast', 'rtlPreview'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const appearance = await AppearanceSetting.findOneAndUpdate(
    { userId: req.user._id }, { ...update, userId: req.user._id }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.json({ success: true, appearance });
};
