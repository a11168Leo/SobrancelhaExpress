import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { uploadServiceImage } from '../middlewares/upload.middleware.js';
import { create, list, update, remove, updateImage } from './service.controller.js';

const router = Router();

// Admin ou profissional cria servico
router.post('/', authMiddleware, allowRoles('admin', 'profissional'), create);
// Listagem publica
router.get('/', list);
// Admin ou profissional dono atualiza/remove
router.patch('/:id', authMiddleware, allowRoles('admin', 'profissional'), update);
router.delete('/:id', authMiddleware, allowRoles('admin', 'profissional'), remove);
// Upload de imagem do servico
router.post(
  '/:id/image',
  authMiddleware,
  allowRoles('admin', 'profissional'),
  uploadServiceImage,
  updateImage
);

export default router;
