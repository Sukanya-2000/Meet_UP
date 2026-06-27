import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsDir = path.resolve('uploads');
const chatUploadsDir = path.resolve('uploads/chat');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(chatUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  },
});

const chatStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, chatUploadsDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  },
});

const fileFilter = (_req, file, callback) => {
  const accepted = ['image/jpeg', 'image/png', 'image/webp'];
  callback(accepted.includes(file.mimetype) ? null : new Error('Only JPG, PNG, and WebP images are allowed'), accepted.includes(file.mimetype));
};

export const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export const uploadChatMedia = multer({
  storage: chatStorage,
  limits: { fileSize: 25 * 1024 * 1024, files: 6 },
});
