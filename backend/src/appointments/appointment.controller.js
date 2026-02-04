import {
  createAppointment,
  findConflictingAppointment,
  listAppointmentsByProfessional,
  listAppointmentsByClient,
  findAppointmentById,
  updateAppointmentStatus
} from './appointment.service.js';
import { findServiceById } from '../services/service.service.js';
import { createFinancial, findFinancialByAppointment } from '../financial/financial.service.js';

// Converte string/data em Date válido
const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Cria agendamento (cliente cria para si; admin pode criar para qualquer cliente)
export const create = async (req, res) => {
  try {
    const { professionalId, startTime, endTime, durationMinutes, notes, clientId } = req.body;

    if (!professionalId || !startTime) {
      return res.status(400).json({ message: 'professionalId e startTime são obrigatórios' });
    }

    const start = parseDate(startTime);
    if (!start) {
      return res.status(400).json({ message: 'startTime inválido' });
    }

    let end = null;
    if (endTime) {
      end = parseDate(endTime);
      if (!end) {
        return res.status(400).json({ message: 'endTime inválido' });
      }
    } else if (durationMinutes) {
      const minutes = Number(durationMinutes);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        return res.status(400).json({ message: 'durationMinutes inválido' });
      }
      end = new Date(start.getTime() + minutes * 60 * 1000);
    } else {
      return res
        .status(400)
        .json({ message: 'endTime ou durationMinutes é obrigatório' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'startTime deve ser menor que endTime' });
    }

    if (req.user.role === 'profissional') {
      return res.status(403).json({ message: 'Profissional não pode criar agendamentos' });
    }

    const conflict = await findConflictingAppointment(professionalId, start, end);
    if (conflict) {
      return res.status(409).json({ message: 'Horário em conflito' });
    }

    const resolvedClientId =
      req.user.role === 'cliente' ? req.user.id : clientId;

    if (!resolvedClientId) {
      return res.status(400).json({ message: 'clientId é obrigatório para admin' });
    }

    const appointment = await createAppointment({
      client: resolvedClientId,
      professional: professionalId,
      startTime: start,
      endTime: end,
      notes
    });

    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento' });
  }
};

// Lista agenda por profissional (profissional só vê a sua; admin vê qualquer)
export const listByProfessional = async (req, res) => {
  try {
    const { professionalId } = req.params;

    if (req.user.role === 'profissional' && professionalId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão para ver outra agenda' });
    }

    const appointments = await listAppointmentsByProfessional(professionalId);
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar agendamentos' });
  }
};

// Lista agenda por cliente (cliente só vê o seu; admin vê qualquer)
export const listByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (req.user.role === 'cliente' && clientId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão para ver outro cliente' });
    }

    const appointments = await listAppointmentsByClient(clientId);
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar agendamentos' });
  }
};

// Atualiza status (admin ou profissional dono do atendimento)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, serviceId } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const existing = await findAppointmentById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    if (req.user.role === 'profissional' && String(existing.professional) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão para este agendamento' });
    }

    const appointment = await updateAppointmentStatus(id, status);
    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Se finalizou o serviço, cria lançamento financeiro (uma única vez)
    if (status === 'completed') {
      const existingFinancial = await findFinancialByAppointment(id);
      if (!existingFinancial) {
        let amount = 0;
        if (serviceId) {
          const service = await findServiceById(serviceId);
          if (service) {
            amount = service.price;
          }
        }

        await createFinancial({
          appointment: id,
          professional: appointment.professional,
          amount,
          notes: serviceId ? 'Auto gerado pelo fechamento' : 'Auto gerado (sem serviço)'
        });
      }
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};
