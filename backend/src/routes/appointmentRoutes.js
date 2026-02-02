const express = require('express');
const router = express.Router();
const { createAppointment, getAgenda } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Cliente marca o horário (Logado)
router.post('/', protect, createAppointment);

// Agenda para o FullCalendar: 
// Profissional vê a dele | Admin vê a de todos
router.get('/calendar', protect, authorize('admin', 'professional'), getAgenda);

module.exports = router;