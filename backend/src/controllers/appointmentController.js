const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { checkAvailability } = require('../services/appointmentService');
const { createNotification } = require('../services/notificationService');

exports.createAppointment = async (req, res) => {
  try {
    const { professionalId, serviceId, date, startTime } = req.body;
    const clientId = req.user._id;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado.' });

    // Converter startTime para minutos
    const [hours, minutes] = startTime.split(':').map(Number);
    const startInMinutes = hours * 60 + minutes;
    const durationWithGap = service.durationMinutes + 5;
    const endInMinutes = startInMinutes + durationWithGap;

    // Horários de funcionamento
    const appointmentDate = new Date(date);
    if (appointmentDate.getUTCDay() === 0) {
      return res.status(400).json({ message: 'Não funcionamos aos domingos.' });
    }

    const blocks = [
      { start: 9 * 60, end: 12 * 60 },
      { start: 13 * 60, end: 15 * 60 },
      { start: 15 * 60 + 15, end: 19 * 60 }
    ];

    const isWithinHours = blocks.some(block => startInMinutes >= block.start && endInMinutes <= block.end);
    if (!isWithinHours) {
      return res.status(400).json({ message: 'Horário fora do expediente ou em pausa.' });
    }

    // Date completo
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + service.durationMinutes * 60 * 1000);

    const isAvailable = await checkAvailability(professionalId, start, end);
    if (!isAvailable) return res.status(400).json({ message: 'Horário ocupado.' });

    const appointment = await Appointment.create({
      clientId,
      professionalId,
      serviceId,
      start,
      end,
      date,
      startTime,
      durationMinutes: service.durationMinutes,
      totalPrice: service.price,
      status: 'pendente'
    });

    const client = await User.findById(clientId).select('name');
    await createNotification(
      professionalId,
      'Novo Agendamento',
      `${client.name} agendou ${service.name} para ${date} às ${startTime}.`,
      'appointment'
    );

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao agendar', error: error.message });
  }
};

exports.getMyAgenda = async (req, res) => {
  try {
    const appointments = await Appointment.find({ professionalId: req.user._id })
      .populate('clientId', 'name phone')
      .populate('serviceId', 'name')
      .sort({ start: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agenda' });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.user._id })
      .populate('professionalId', 'name')
      .populate('serviceId', 'name')
      .sort({ start: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar meus agendamentos' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });

    if (appointment.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado a cancelar' });
    }

    appointment.status = 'cancelado';
    await appointment.save();

    const professional = await User.findById(appointment.professionalId).select('name');
    await createNotification(
      appointment.professionalId,
      'Agendamento Cancelado',
      `O agendamento de ${professional.name} em ${appointment.date} às ${appointment.startTime} foi cancelado.`,
      'appointment'
    );

    res.json({ message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar', error: error.message });
  }
};