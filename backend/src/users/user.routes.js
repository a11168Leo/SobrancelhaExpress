import { Router } from 'express';
import { register, login, me, adminOnly, updateAvatar } from './user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { uploadProfessionalAvatar } from '../middlewares/upload.middleware.js';

const router = Router();

// Auth
router.post('/register', register);
router.post('/login', login);
// Perfil do usuario autenticado
router.get('/me', authMiddleware, me);
// Upload de avatar
router.patch('/me/avatar', authMiddleware, uploadProfessionalAvatar, updateAvatar);
// Teste de rota admin
router.get('/admin', authMiddleware, allowRoles('admin'), adminOnly);

export default router;
