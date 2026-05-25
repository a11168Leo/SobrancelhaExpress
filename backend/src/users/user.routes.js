/* ======================================== */
/* ARQUIVO: BACKEND/SRC/USERS/USER.ROUTES.JS */
/* ======================================== */

// Importacoes
import { Router } from 'express';
import {
  register,
  login,
  me,
  adminOnly,
  updateAvatar,
  updateProfessionalAvatar,
  adminCreateUser,
  publicCreateProfessional,
  adminDeleteUser,
  updateMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  listProfessionalsPublic,
  listClientsPublic,
  updateProfessionalAbout,
  updateProfessional,
  publicCreateClientWithTemporaryPassword
} from './user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { uploadProfessionalAvatar } from '../middlewares/upload.middleware.js';

// Bloco: router
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// ====================
// Perfil do usuario autenticado
// ====================
router.get('/me', authMiddleware, me);
// ====================
// Listagem publica de profissionais (site cliente)
// ====================
router.get('/professionals', listProfessionalsPublic);
router.get('/clients', listClientsPublic);
router.post('/clients/temp', publicCreateClientWithTemporaryPassword);
// rota pública para cadastro de profissional (sem autenticação, para admin/inicialização)
router.post('/professionals', publicCreateProfessional);
router.patch('/professionals/:id', updateProfessional);
router.patch('/professionals/:id/avatar', uploadProfessionalAvatar, updateProfessionalAvatar);
// ====================
// Upload de avatar
// ====================
router.patch('/me/avatar', authMiddleware, uploadProfessionalAvatar, updateAvatar);
// ====================
// Teste de rota admin
// ====================
router.get('/admin', authMiddleware, allowRoles('admin'), adminOnly);
// ====================
// Admin e profissional: criar usuarios (profissional apenas cliente)
// ====================
router.post('/users', authMiddleware, allowRoles('admin', 'profissional'), adminCreateUser);
router.delete('/users/:id', authMiddleware, allowRoles('admin'), adminDeleteUser);
// ====================
// Atualizacoes da conta
// ====================
router.patch('/me', authMiddleware, updateMe);
router.patch('/me/password', authMiddleware, updatePassword);
// ====================
// Sobre da profissional (admin ou a propria profissional)
// ====================
router.patch(
  '/professionals/:id/about',
  authMiddleware,
  allowRoles('admin', 'profissional'),
  updateProfessionalAbout
);

// Exportacao principal
export default router;

