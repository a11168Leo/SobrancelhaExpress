/* ======================================== */
/* ARQUIVO: BACKEND/SRC/FINANCIAL/FINANCIAL.CONTROLLER.JS */
/* ======================================== */

// Importacoes
import {
  createFinancial,
  findFinancialById,
  findFinancialByAppointment,
  listFinancials,
  updateFinancialStatus
} from './financial.service.js';
import { reportByPeriod, compareByPeriod } from './financial.report.service.js';
import { findAppointmentById } from '../appointments/appointment.service.js';

// Funcao exportada: create
export const create = async (req, res) => {
  try {
    const { appointmentId, professionalId, amount, notes } = req.body;

    if (!appointmentId || !professionalId || amount === undefined) {
      return res
        .status(400)
        .json({ message: 'appointmentId, professionalId e amount sao obrigatorios' });
    }

    const appointment = await findAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento nao encontrado' });
    }

    const existing = await findFinancialByAppointment(appointmentId);
    if (existing) {
      return res.status(409).json({ message: 'Financeiro ja existe para este agendamento' });
    }

    const financial = await createFinancial({
      appointment: appointmentId,
      professional: professionalId,
      amount,
      notes
    });

    res.status(201).json({ financial });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar financeiro' });
  }
};

// Funcao exportada: list
export const list = async (req, res) => {
  try {
    const filters = {};

    if (req.user.role === 'profissional') {
      filters.professional = req.user.id;
    }

    const financials = await listFinancials(filters);
    res.json({ financials });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar financeiro' });
  }
};

// Funcao exportada: updateStatus
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status invalido' });
    }

    const existing = await findFinancialById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Lancamento nao encontrado' });
    }

    const updated = await updateFinancialStatus(id, status);
    res.json({ financial: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar financeiro' });
  }
};

// Funcao exportada: report
export const report = async (req, res) => {
  try {
    const { start, end, professionalId } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: 'start e end sao obrigatorios' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Datas invalidas' });
    }

    const scopedProfessionalId =
      req.user.role === 'profissional' ? req.user.id : professionalId;

    const data = await reportByPeriod(startDate, endDate, scopedProfessionalId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatorio' });
  }
};

// Funcao exportada: reportCompare
export const reportCompare = async (req, res) => {
  try {
    const { startA, endA, startB, endB, professionalId } = req.query;

    if (!startA || !endA || !startB || !endB) {
      return res.status(400).json({ message: 'startA, endA, startB e endB sao obrigatorios' });
    }

    const aStart = new Date(startA);
    const aEnd = new Date(endA);
    const bStart = new Date(startB);
    const bEnd = new Date(endB);

    if (
      Number.isNaN(aStart.getTime()) ||
      Number.isNaN(aEnd.getTime()) ||
      Number.isNaN(bStart.getTime()) ||
      Number.isNaN(bEnd.getTime())
    ) {
      return res.status(400).json({ message: 'Datas invalidas' });
    }

    const scopedProfessionalId =
      req.user.role === 'profissional' ? req.user.id : professionalId;

    const data = await compareByPeriod(aStart, aEnd, bStart, bEnd, scopedProfessionalId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatorio comparativo' });
  }
};
