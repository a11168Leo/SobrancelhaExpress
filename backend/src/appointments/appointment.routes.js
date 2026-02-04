import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import {
  create,
  listByProfessional,
  listByClient,
  updateStatus,
  listAll,
  update
} from './appointment.controller.js';

const router = Router();

// Cliente cria para si; admin cria para qualquer cliente
router.post('/', authMiddleware, allowRoles('admin', 'cliente'), create);
// Admin vê qualquer agenda; profissional vê apenas a sua
router.get(
  '/professional/:professionalId',
  authMiddleware,
  allowRoles('admin', 'profissional'),
  listByProfessional
);
// Admin vê todos os agendamentos
router.get('/all', authMiddleware, allowRoles('admin'), listAll);
// Admin vê qualquer cliente; cliente vê apenas o próprio
router.get('/client/:clientId', authMiddleware, allowRoles('admin', 'cliente'), listByClient);
// Admin ou profissional (dono do atendimento) atualiza status
router.patch('/:id/status', authMiddleware, allowRoles('admin', 'profissional'), updateStatus);
// Admin atualiza agendamento
router.patch('/:id', authMiddleware, allowRoles('admin'), update);

export default router;
