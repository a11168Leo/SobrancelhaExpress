const express = require('express');
const router = express.Router();
const { createAppointment, getAgenda } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, createAppointment);
router.get('/calendar', protect, authorize('admin', 'professional'), getAgenda);

module.exports = router;