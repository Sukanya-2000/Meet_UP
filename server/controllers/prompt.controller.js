import ProfilePrompt from '../models/ProfilePrompt.js';
const clean = (body) => ({ category: body.category, prompt: String(body.prompt || '').trim(), answer: String(body.answer || '').trim(), photoUrl: String(body.photoUrl || '').trim(), orderIndex: Number(body.orderIndex) });
const validate = (value) => {
  if (!['about-me','values','dating','lifestyle','fun'].includes(value.category) || !value.prompt || !value.answer || !Number.isInteger(value.orderIndex) || value.orderIndex < 0 || value.orderIndex > 2) { const error = new Error('Complete a valid prompt, answer, category, and order'); error.statusCode = 400; throw error; }
};
export const listPrompts = async (req, res) => res.json({ success: true, prompts: await ProfilePrompt.find({ userId: req.user._id }).sort({ orderIndex: 1 }) });
export const savePrompt = async (req, res) => { const value = clean(req.body); validate(value); const prompt = await ProfilePrompt.findOneAndUpdate({ userId: req.user._id, orderIndex: value.orderIndex }, { ...value, userId: req.user._id, moderationStatus: 'pending', moderationNote: '' }, { upsert: true, new: true, runValidators: true }); res.status(201).json({ success: true, prompt }); };
export const updatePrompt = async (req, res) => { const value = clean(req.body); validate(value); const prompt = await ProfilePrompt.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { ...value, moderationStatus: 'pending', moderationNote: '' }, { new: true, runValidators: true }); if (!prompt) { res.status(404); throw new Error('Prompt not found'); } res.json({ success: true, prompt }); };
export const deletePrompt = async (req, res) => { await ProfilePrompt.deleteOne({ _id: req.params.id, userId: req.user._id }); res.json({ success: true }); };
