const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

class AppointmentService {
  async createAppointment(data) {
    const service = await Service.findById(data.serviceId);
    if (!service) {
      throw new Error('Serviço não encontrado');
    }

    const start = new Date(data.start);
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    return Appointment.create({
      clientId: data.clientId,
      professionalId: data.professionalId,
      serviceId: data.serviceId,
      start,
      end
    });
  }

  async getCalendar(professionalId) {
    return Appointment.find({ professionalId })
      .populate('serviceId', 'name')
      .populate('clientId', 'name')
      .lean();
  }

  async updateStatus(id, status) {
    return Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}

module.exports = new AppointmentService();
