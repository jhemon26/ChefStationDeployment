const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Only JPG, PNG, or WEBP images allowed'));
  }
  cb(null, true);
};

const makeUpload = (folder) => {
  const uploadRoot = path.join(env.UPLOAD_DIR, folder);
  fs.mkdirSync(uploadRoot, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      // Use cryptographically secure random bytes — not Math.random()
      const unique = crypto.randomBytes(16).toString('hex');
      cb(null, `${unique}${ext}`);
    },
  });

  return {
    uploadRoot,
    upload: multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  };
};

const { upload, uploadRoot } = makeUpload('recipes');
const { upload: avatarUpload, uploadRoot: avatarUploadRoot } = makeUpload('users');

module.exports = { upload, uploadRoot, avatarUpload, avatarUploadRoot };
