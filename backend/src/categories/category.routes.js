import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { create, list, update, remove } from './category.controller.js';

const router = Router();

// Admin cria/edita/remove categorias
router.post('/', authMiddleware, allowRoles('admin'), create);
router.patch('/:id', authMiddleware, allowRoles('admin'), update);
router.delete('/:id', authMiddleware, allowRoles('admin'), remove);

// Listagem pode ser pública ou autenticada (aqui deixei pública)
router.get('/', list);

export default router;
