const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

async function compressImage(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outputPath);
  await fs.unlink(inputPath).catch(() => {});
  return outputPath;
}

module.exports = { compressImage };
