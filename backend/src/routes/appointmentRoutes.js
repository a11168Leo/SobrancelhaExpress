const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getCalendar,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middlewares/authMiddleware');

router.post(
  '/',
  protect,
  authorize('client'),
  createAppointment
);

router.get(
  '/calendar',
  protect,
  authorize('admin', 'professional'),
  getCalendar
);

router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'professional'),
  updateAppointmentStatus
);

module.exports = router;
