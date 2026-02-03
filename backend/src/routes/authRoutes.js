const express = require('express');
const router = express.Router();

// Importe todas as funções necessárias do controller
const {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  promoteUser,
  getAllUsers
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// ROTAS PÚBLICAS (qualquer pessoa pode acessar sem token)
router.post('/register', register);   // ← SEM protect, SEM authorize aqui!
router.post('/login', login);

// ROTAS QUE EXIGEM AUTENTICAÇÃO (token JWT)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// ROTAS EXCLUSIVAS PARA ADMIN (exigem token + role admin)
router.put('/promote', protect, authorize('admin'), promoteUser);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;