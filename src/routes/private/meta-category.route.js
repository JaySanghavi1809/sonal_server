const express = require('express');
const router = express.Router();
const meta_category = require('../../controllers/meta_category');
const userValidator = require('../../validators/user.validate.schema');

router.post('/create', meta_category.CreateCategory);
router.get('/get-all-category', meta_category.GetAllCategory);
router.get('/get-meta-category/:metaCatId', meta_category.GetCategoryById);
router.put("/update-meta-category/:MetaCatId", meta_category.UpdateCategory);
router.delete('/delete-meta-category/:categoryId', meta_category.deleteCategory)


module.exports = router;