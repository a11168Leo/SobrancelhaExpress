const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getCategories, 
    getCategoryById // Verifique se este nome está igual ao do Controller
} = require('../controllers/categoryController');

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/', getCategories);
router.get('/:id', getCategoryById); // Linha 16 - Agora deve funcionar!
router.post('/', protect, authorize('admin'), createCategory);

module.exports = router;