
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { create, list, updateStatus, report, reportCompare } from './financial.controller.js';

const router = Router();




router.post('/', authMiddleware, allowRoles('admin'), create);
// ====================
// Admin vÃª tudo; profissional vÃª apenas o seu
// ====================
router.get('/', authMiddleware, allowRoles('admin', 'profissional'), list);
// ====================
// Admin altera status
// ====================
router.patch('/:id/status', authMiddleware, allowRoles('admin'), updateStatus);
// ====================
// Relatorio por periodo (admin)
// ====================
router.get('/report', authMiddleware, allowRoles('admin', 'profissional'), report);
// ====================
// Relatorio comparativo (admin)
// ====================
router.get('/report/compare', authMiddleware, allowRoles('admin', 'profissional'), reportCompare);

export default router;





