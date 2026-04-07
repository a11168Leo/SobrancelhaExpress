/* ======================================== */
/* ARQUIVO: BACKEND/SRC/APPOINTMENTS/APPOINTMENT.ROUTES.JS */
/* ======================================== */

// Importacoes
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import {
  create,
  listByProfessional,
  listByClient,
  updateStatus,
  listAll,
  listCalendarPublic,
  update
} from './appointment.controller.js';

// Bloco: router
const router = Router();

router.get('/calendar', listCalendarPublic);
router.post('/public', create);
router.patch('/public/:id', update);
router.post('/', authMiddleware, allowRoles('admin', 'cliente', 'profissional'), create);
// ====================
// Admin vÃª qualquer agenda; profissional vÃª apenas a sua
// ====================
router.get(
  '/professional/:professionalId',
  authMiddleware,
  allowRoles('admin', 'profissional'),
  listByProfessional
);
// ====================
// Admin vÃª todos os agendamentos
// ====================
router.get('/all', authMiddleware, allowRoles('admin'), listAll);
// ====================
// Admin vÃª qualquer cliente; cliente vÃª apenas o prÃ³prio
// ====================
router.get('/client/:clientId', authMiddleware, allowRoles('admin', 'cliente'), listByClient);
// ====================
// Admin ou profissional (dono do atendimento) atualiza status
// ====================
router.patch('/:id/status', authMiddleware, allowRoles('admin', 'profissional'), updateStatus);
// ====================
// Admin atualiza agendamento
// ====================
router.patch('/:id', authMiddleware, allowRoles('admin'), update);

// Exportacao principal
export default router;

