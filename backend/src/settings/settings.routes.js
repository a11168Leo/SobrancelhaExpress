import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { getBusinessHours, updateBusinessHours } from './settings.controller.js';

const router = Router();

router.get('/business-hours', authMiddleware, allowRoles('admin', 'profissional'), getBusinessHours);
router.put('/business-hours', authMiddleware, allowRoles('admin', 'profissional'), updateBusinessHours);

export default router;
