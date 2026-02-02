const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Rota para Clientes (Site A - Público)
router.post('/register-client', register);

// Rota para o Admin criar Profissionais ou outros Admins (Site B - Protegido)
router.post('/register-staff', protect, authorize('admin'), register);

// Login unificado (Para todos)
router.post('/login', login);

module.exports = router;