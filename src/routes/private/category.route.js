const express = require('express');
const router = express.Router();
const CategoryController = require('../../controllers/category.controller');

/** Create channel */
router.post('/create', CategoryController.CreateCategory);
router.get('/get-all-category', CategoryController.GetAllCategory);
router.get('/get-meta-category/:metaCatId', CategoryController.GetCategoryById);
router.put("/update-meta-category", CategoryController.UpdateCategory);
router.delete('/delete-meta-category', CategoryController.deleteCategory)


module.exports = router;