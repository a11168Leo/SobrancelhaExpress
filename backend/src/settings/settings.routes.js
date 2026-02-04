import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { getBusinessHours, updateBusinessHours } from './settings.controller.js';

const router = Router();

router.get('/business-hours', authMiddleware, allowRoles('admin'), getBusinessHours);
router.put('/business-hours', authMiddleware, allowRoles('admin'), updateBusinessHours);

export default router;
