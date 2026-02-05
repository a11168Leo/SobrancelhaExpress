import { Router } from 'express';
import {
  register,
  login,
  me,
  adminOnly,
  updateAvatar,
  adminCreateUser,
  adminDeleteUser,
  updateMe,
  updatePassword,
  forgotPassword,
  resetPassword
} from './user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { uploadProfessionalAvatar } from '../middlewares/upload.middleware.js';

const router = Router();

// Auth
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// Perfil do usuario autenticado
router.get('/me', authMiddleware, me);
// Upload de avatar
router.patch('/me/avatar', authMiddleware, uploadProfessionalAvatar, updateAvatar);
// Teste de rota admin
router.get('/admin', authMiddleware, allowRoles('admin'), adminOnly);
// Admin: criar e remover usuários
router.post('/users', authMiddleware, allowRoles('admin'), adminCreateUser);
router.delete('/users/:id', authMiddleware, allowRoles('admin'), adminDeleteUser);
// Atualizações da conta
router.patch('/me', authMiddleware, updateMe);
router.patch('/me/password', authMiddleware, updatePassword);

export default router;
