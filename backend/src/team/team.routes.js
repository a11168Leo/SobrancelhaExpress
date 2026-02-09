import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { listByRole, listProfessionals, listClients } from './team.controller.js';

const router = Router();

// Rotas de equipe (admin)
router.get('/professionals', authMiddleware, allowRoles('admin'), listProfessionals);
router.get('/clients', authMiddleware, allowRoles('admin', 'profissional'), listClients);
router.get('/role/:role', authMiddleware, allowRoles('admin'), listByRole);

export default router;
