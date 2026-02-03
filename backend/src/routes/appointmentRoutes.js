const express = require('express');
const router = express.Router();
const { createAppointment, getMyAgenda, getMyAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, createAppointment);
router.get('/my-agenda', protect, authorize('admin', 'professional'), getMyAgenda);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;