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
const chatFileFilter = (_req, file, callback) => {
  const accepted = new Set(['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/webm','audio/wav','application/pdf','text/plain']);
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = new Set(['.jpg','.jpeg','.png','.webp','.gif','.mp4','.webm','.mp3','.wav','.pdf','.txt']);
  const allowed = accepted.has(file.mimetype) && allowedExtensions.has(extension);
  callback(allowed ? null : new Error('Unsupported or mismatched media type'), allowed);
};

export const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export const uploadChatMedia = multer({
  storage: chatStorage,
  fileFilter: chatFileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 6 },
});
