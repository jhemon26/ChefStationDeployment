const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const fileFilter = (_req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
  if (!ok) return cb(new Error('Only JPG, PNG, or WEBP images allowed'));
  cb(null, true);
};

const makeUpload = (folder) => {
  const uploadRoot = path.join(env.UPLOAD_DIR, folder);
  fs.mkdirSync(uploadRoot, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      cb(null, `tmp-${unique}${ext}`);
    },
  });

  return {
    uploadRoot,
    upload: multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  };
};

const { upload, uploadRoot } = makeUpload('recipes');
const { upload: avatarUpload, uploadRoot: avatarUploadRoot } = makeUpload('users');

module.exports = { upload, uploadRoot, avatarUpload, avatarUploadRoot };
