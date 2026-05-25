/* ======================================== */
/* ARQUIVO: BACKEND/SRC/NOTIFICATIONS/NOTIFICATION.ROUTES.JS */
/* ======================================== */

// Importacoes
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { create, listMine, markRead, remove } from './notification.controller.js';

// Bloco: router
const router = Router();

router.post('/', authMiddleware, allowRoles('admin'), create);
// ====================
// Usuario autenticado lista as suas notificacoes
// ====================
router.get('/me', authMiddleware, listMine);
// ====================
// Usuario marca notificacao como lida
// ====================
router.patch('/:id/read', authMiddleware, markRead);
// ====================
// Usuario remove notificacao
// ====================
router.delete('/:id', authMiddleware, remove);

// Exportacao principal
export default router;

