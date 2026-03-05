
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { Router } from 'express';
import userRoutes from './users/user.routes.js';
import appointmentRoutes from './appointments/appointment.routes.js';
import categoryRoutes from './categories/category.routes.js';
import serviceRoutes from './services/service.routes.js';
import financialRoutes from './financial/financial.routes.js';
import notificationRoutes from './notifications/notification.routes.js';
import teamRoutes from './team/team.routes.js';
import settingsRoutes from './settings/settings.routes.js';

const routes = Router();

routes.use('/auth', userRoutes);
routes.use('/appointments', appointmentRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/services', serviceRoutes);
routes.use('/financial', financialRoutes);
routes.use('/notifications', notificationRoutes);
routes.use('/team', teamRoutes);
routes.use('/settings', settingsRoutes);

export default routes;



