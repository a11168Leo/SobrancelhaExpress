const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Público: Para o cliente ver os filtros no site
router.get('/', getCategories);

// Privado: Apenas o Admin constrói a hierarquia
router.post('/', protect, authorize('admin'), createCategory);

module.exports = router;