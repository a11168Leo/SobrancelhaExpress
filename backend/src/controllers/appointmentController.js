const Appointment = require("../models/Appointment");

exports.createAppointment = async (req, res) => {
  const appointment = await Appointment.create(req.body);
  res.status(201).json(appointment);
};

//  FullCalendar 
exports.getAppointments = async (req, res) => {
  const events = await Appointment.find({
    professional: req.params.professionalId
  }).populate("client service");

  res.json(
    events.map(ev => ({
      id: ev._id,
      title: ev.title,
      start: ev.start,
      end: ev.end
    }))
  );
};
