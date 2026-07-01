import GifActivity from '../models/GifActivity.js';
const provider = async (path, query = {}) => {
  if (!process.env.GIPHY_API_KEY) { const error = new Error('GIF provider is not configured'); error.statusCode = 503; throw error; }
  const params = new URLSearchParams({ api_key: process.env.GIPHY_API_KEY, limit: '24', rating: 'pg-13', ...query });
  const response = await fetch(`https://api.giphy.com/v1/gifs/${path}?${params}`); if (!response.ok) { const error = new Error('GIF provider is unavailable'); error.statusCode = 502; throw error; }
  const body = await response.json(); return (body.data || []).map((gif) => ({ id: gif.id, title: gif.title, url: gif.images?.fixed_height?.url || gif.images?.original?.url, previewUrl: gif.images?.fixed_height_small?.url }));
};
export const search = async (req, res) => { const q = String(req.query.q || '').trim(); if (!q) { res.status(400); throw new Error('Search text is required'); } res.json({ success: true, gifs: await provider('search', { q }) }); };
export const trending = async (_req, res) => res.json({ success: true, gifs: await provider('trending') });
export const activity = async (req, res) => res.json({ success: true, favorites: await GifActivity.find({ userId: req.user._id, favorite: true }).sort({ updatedAt: -1 }), recent: await GifActivity.find({ userId: req.user._id }).sort({ lastUsedAt: -1 }).limit(24) });
export const save = async (req, res) => { if (!req.body.gifId || !/^https:\/\//.test(req.body.url || '')) { res.status(400); throw new Error('Valid GIF details are required'); } const item = await GifActivity.findOneAndUpdate({ userId: req.user._id, gifId: req.body.gifId }, { userId: req.user._id, gifId: req.body.gifId, url: req.body.url, title: String(req.body.title || ''), favorite: Boolean(req.body.favorite), lastUsedAt: new Date() }, { upsert: true, new: true }); res.json({ success: true, item }); };
