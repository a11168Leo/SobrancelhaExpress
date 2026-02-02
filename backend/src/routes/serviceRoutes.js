const express = require('express');
const router = express.Router();
const { createService, getServices } = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Linha 8: Verifique se o segundo argumento é exatamente 'getServices'
router.get('/', getServices); 

router.post('/', protect, authorize('admin'), createService);

module.exports = router;