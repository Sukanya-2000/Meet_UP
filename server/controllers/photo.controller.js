import fs from 'fs/promises';
import path from 'path';
import Photo from '../models/Photo.js';

export const getPhotos = async (req, res) => {
  const photos = await Photo.find({ userId: req.user._id }).sort({ orderIndex: 1 });
  res.json({ success: true, photos });
};

export const upload = async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    res.status(400);
    throw new Error('Select at least one photo');
  }

  const existingCount = await Photo.countDocuments({ userId: req.user._id });
  if (existingCount + files.length > 6) {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
    res.status(400);
    throw new Error('You can upload a maximum of 6 photos');
  }

  const photos = await Photo.insertMany(files.map((file, index) => ({
    userId: req.user._id,
    imageUrl: `/uploads/${file.filename}`,
    isMain: existingCount === 0 && index === 0,
    orderIndex: existingCount + index,
  })));
  res.status(201).json({ success: true, message: 'Photos uploaded successfully', photos });
};

export const remove = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id, userId: req.user._id });
  if (!photo) {
    res.status(404);
    throw new Error('Photo not found');
  }
  await photo.deleteOne();
  await fs.unlink(path.resolve(`.${photo.imageUrl}`)).catch(() => {});

  const remaining = await Photo.find({ userId: req.user._id }).sort({ orderIndex: 1 });
  if (remaining.length && photo.isMain) {
    remaining[0].isMain = true;
    await remaining[0].save();
  }
  await Promise.all(remaining.map((item, index) => Photo.updateOne({ _id: item._id }, { orderIndex: index })));
  res.json({ success: true, message: 'Photo deleted successfully' });
};

export const setMain = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id, userId: req.user._id });
  if (!photo) {
    res.status(404);
    throw new Error('Photo not found');
  }
  await Photo.updateMany({ userId: req.user._id }, { isMain: false });
  photo.isMain = true;
  await photo.save();
  res.json({ success: true, message: 'Main photo updated', photo });
};

export const reorder = async (req, res) => {
  const ids = req.body.photoIds || [];
  const ownedCount = await Photo.countDocuments({ _id: { $in: ids }, userId: req.user._id });
  if (!ids.length || ownedCount !== ids.length) {
    res.status(400);
    throw new Error('Invalid photo order');
  }
  await Promise.all(ids.map((id, orderIndex) => Photo.updateOne({ _id: id }, { orderIndex })));
  res.json({ success: true, message: 'Photo order updated' });
};
