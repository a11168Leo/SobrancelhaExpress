const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController'); // Caminho corrigido
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/', getCategories);
router.post('/', protect, authorize('admin'), createCategory);

module.exports = router;