/* ======================================== */
/* ARQUIVO: BACKEND/SRC/CATEGORIES/CATEGORY.ROUTES.JS */
/* ======================================== */

// Importacoes
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { create, list, update, remove } from './category.controller.js';

// Bloco: router
const router = Router();

router.post('/public', create);
router.post('/', authMiddleware, allowRoles('admin'), create);
router.patch('/:id', authMiddleware, allowRoles('admin'), update);
router.delete('/:id', authMiddleware, allowRoles('admin'), remove);

router.get('/', list);

// Exportacao principal
export default router;

