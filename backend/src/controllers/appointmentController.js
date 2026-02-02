const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Notification = require('../models/Notification');

// Criar um novo agendamento (Site do Cliente)
exports.createAppointment = async (req, res) => {
  try {
    const { profissionalId, servicoId, start, observacoes } = req.body;
    const clienteId = req.user.id; // Pegamos o ID do token do cliente logado

    // 1. Buscar a duração do serviço para calcular o 'end'
    const service = await Service.findById(servicoId);
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });

    // 2. Calcular o horário de término (Data de início + minutos do serviço)
    const startTime = new Date(start);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

    // 3. Criar o agendamento
    const appointment = await Appointment.create({
      clienteId,
      profissionalId,
      servicoId,
      start: startTime,
      end: endTime,
      observacoes
    });

    // 4. REGRA DE NEGÓCIO: Criar notificação apenas para o profissional
    await Notification.create({
      recipientId: profissionalId,
      type: 'NEW_APPOINTMENT',
      title: 'Novo Agendamento! 📅',
      message: `${req.user.name} agendou ${service.name} para o dia ${startTime.toLocaleString()}`
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Listar agendamentos (Para o FullCalendar do Profissional)
exports.getProfessionalAgenda = async (req, res) => {
  try {
    // O profissional só vê os agendamentos dele
    const appointments = await Appointment.find({ profissionalId: req.user.id })
      .populate('clienteId', 'name phone')
      .populate('servicoId', 'name price');
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// No arquivo src/controllers/appointmentController.js

exports.getAgenda = async (req, res) => {
  try {
    let query = {};

    // REGRA: Se não for admin, ele só vê os próprios agendamentos
    if (req.user.role !== 'admin') {
      query.profissionalId = req.user.id;
    } 
    // Se for admin e quiser filtrar por um profissional específico, ele pode enviar o ID na URL
    else if (req.query.profissionalId) {
      query.profissionalId = req.query.profissionalId;
    }

    const appointments = await Appointment.find(query)
      .populate('clienteId', 'name phone')
      .populate('profissionalId', 'name profileImage') // Admin vê quem é o prof.
      .populate('servicoId', 'name price');
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};