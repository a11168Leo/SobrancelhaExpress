const express = require('express');
const router = express.Router();
const { createService, getServices } = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Público: Ver lista de serviços
router.get('/', getServices);

// Privado: Apenas Admin cria/edita serviços
router.post('/', protect, authorize('admin'), createService);

module.exports = router;