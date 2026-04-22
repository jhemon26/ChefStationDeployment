const fs = require('fs/promises');
const path = require('path');
const Recipe = require('../models/Recipe');
const Dish = require('../models/Dish');
const { compressImage } = require('../utils/compressImage');
const { uploadRoot } = require('../middleware/fileUpload');

const toPublicPhotoUrl = (filename) => `/uploads/recipes/${filename}`;

const photoUrlToPath = (photoUrl) => {
  if (!photoUrl || !photoUrl.startsWith('/uploads/recipes/')) return null;
  return path.join(uploadRoot, path.basename(photoUrl));
};

async function finalizeUpload(file) {
  if (!file) return null;

  const outputName = `${path.parse(file.filename).name.replace(/^tmp-/, '')}.webp`;
  const outputPath = path.join(uploadRoot, outputName);
  await compressImage(file.path, outputPath);
  return toPublicPhotoUrl(outputName);
}

async function cleanupFile(filePath) {
  if (!filePath) return;
  await fs.unlink(filePath).catch(() => {});
}

const normalizeAllergens = (allergens) => {
  if (!Array.isArray(allergens)) return [];

  return allergens
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item.trim(), is_custom: true };
      }

      if (!item || typeof item !== 'object') return null;

      return {
        name: String(item.name || '').trim(),
        is_custom: Boolean(item.is_custom),
      };
    })
    .filter((item) => item && item.name);
};

const parseAllergens = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return normalizeAllergens(value);

  try {
    return normalizeAllergens(JSON.parse(value));
  } catch {
    return [];
  }
};

async function list(req, res, next) {
  try {
    const rows = await Recipe.listByRestaurant(req.user.restaurant_id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const row = await Recipe.findById(req.params.id, req.user.restaurant_id);
    if (!row) return res.status(404).json({ error: 'Recipe not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  let photo_url = null;
  try {
    let dish = null;
    const dishName = String(req.body.dish_name || '').trim();
    const ingredients = req.body.ingredients ? String(req.body.ingredients).trim() : null;
    const allergens = parseAllergens(req.body.allergens);

    if (dishName) {
      const existingDishes = await Dish.listByRestaurant(req.user.restaurant_id);
      dish =
        existingDishes.find(
          (item) => !item.show_on_menu && item.name.trim().toLowerCase() === dishName.toLowerCase()
        ) || null;

      if (!dish) {
        dish = await Dish.createWithAllergens({
          restaurant_id: req.user.restaurant_id,
          name: dishName,
          course: req.body.section ? String(req.body.section).trim() : null,
          ingredients,
          show_on_menu: false,
          created_by: req.user.id,
          allergens,
        });
      } else if (allergens.length > 0 || ingredients) {
        const mergedAllergens =
          allergens.length > 0
            ? [
                ...(dish.allergens || []).map((item) => ({
                  name: item.name,
                  is_custom: Boolean(item.is_custom),
                })),
                ...allergens,
              ].filter(
                (item, index, array) =>
                  array.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === index
              )
            : undefined;
        await Dish.updateWithAllergens(dish.id, req.user.restaurant_id, {
          course: req.body.section ? String(req.body.section).trim() : undefined,
          ingredients,
          allergens: mergedAllergens,
        });
      }
    }

    if (!dish) {
      await cleanupFile(req.file?.path);
      return res.status(404).json({ error: 'Dish not found' });
    }

    photo_url = await finalizeUpload(req.file);
    const row = await Recipe.create({
      restaurant_id: req.user.restaurant_id,
      dish_id: Number(dish.id),
      steps: req.body.steps,
      notes: req.body.notes || null,
      prep_time_mins: req.body.prep_time_mins === undefined ? null : Number(req.body.prep_time_mins),
      total_steps: req.body.total_steps === undefined ? null : Number(req.body.total_steps),
      section: req.body.section ? String(req.body.section).trim() : null,
      photo_url,
      created_by: req.user.id,
    });

    const fullRecipe = await Recipe.findById(row.id, req.user.restaurant_id);
    res.status(201).json(fullRecipe || row);
  } catch (e) {
    await cleanupFile(req.file?.path);
    await cleanupFile(photoUrlToPath(photo_url));
    next(e);
  }
}

async function update(req, res, next) {
  let photo_url;
  try {
    const existing = await Recipe.findById(req.params.id, req.user.restaurant_id);
    if (!existing) {
      await cleanupFile(req.file?.path);
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (req.file) {
      photo_url = await finalizeUpload(req.file);
    }

    const updated = await Recipe.update(req.params.id, req.user.restaurant_id, {
      steps: req.body.steps,
      notes: req.body.notes,
      prep_time_mins: req.body.prep_time_mins === undefined ? undefined : Number(req.body.prep_time_mins),
      total_steps: req.body.total_steps === undefined ? undefined : Number(req.body.total_steps),
      section: req.body.section === undefined ? undefined : String(req.body.section).trim(),
      photo_url,
    });

    if (!updated) return res.status(404).json({ error: 'Recipe not found' });

    if (photo_url && existing.photo_url && existing.photo_url !== photo_url) {
      await cleanupFile(photoUrlToPath(existing.photo_url));
    }

    const fullRecipe = await Recipe.findById(updated.id, req.user.restaurant_id);
    res.json(fullRecipe || updated);
  } catch (e) {
    await cleanupFile(req.file?.path);
    await cleanupFile(photoUrlToPath(photo_url));
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const removed = await Recipe.remove(req.params.id, req.user.restaurant_id);
    if (!removed) return res.status(404).json({ error: 'Recipe not found' });

    await cleanupFile(photoUrlToPath(removed.photo_url));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getOne, create, update, remove };
