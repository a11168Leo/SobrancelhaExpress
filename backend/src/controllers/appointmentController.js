const appointmentService = require('../services/appointmentService');

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment({
      ...req.body,
      clientId: req.user._id
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const professionalId =
      req.user.role === 'professional'
        ? req.user._id
        : req.query.professionalId;

    const appointments =
      await appointmentService.getCalendar(professionalId);

    const events = appointments.map(app => ({
      id: app._id,
      title: app.serviceId.name,
      start: app.start,
      end: app.end,
      color: app.color
    }));

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await appointmentService.updateStatus(
      req.params.id,
      req.body.status
    );

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
