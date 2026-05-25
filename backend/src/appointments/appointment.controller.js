/* ======================================== */
/* BACKEND/SRC/APPOINTMENTS/APPOINTMENT.CONTROLLER.JS */
/* ======================================== */

// Importacoes
import {
  createAppointment,
  findConflictingAppointment,
  listAppointmentsByProfessional,
  listAppointmentsByClient,
  findAppointmentById,
  listAllAppointments,
  updateAppointmentStatus,
  findConflictingAppointmentExcluding,
  updateAppointment
} from './appointment.service.js'
import { findServiceById } from '../services/service.service.js'
import { createFinancial, findFinancialByAppointment } from '../financial/financial.service.js'
import { createNotification } from '../notifications/notification.service.js'
import { listUsers, findUserById } from '../users/user.service.js'
import nodemailer from 'nodemailer'

// Bloco: parseDate
const parseDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Bloco: VALID_UNITS
const VALID_UNITS = ['cascais', 'almada']

const pad = (n) => String(n).padStart(2, '0')

async function sendAppointmentEmails({ professional, client, service, start, unit }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  const from = process.env.SMTP_FROM || `"Sobrancelhas Express" <${process.env.SMTP_USER}>`
  const dateStr = start.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`
  const unitLabel = unit === 'almada' ? 'Almada' : 'Cascais'
  const serviceName = service?.name || 'Serviço'

  const sharedStyle = `font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;`
  const headerStyle = `background:linear-gradient(135deg,#ffa3b0,#c95184);padding:32px 28px;text-align:center;color:#fff;`
  const bodyStyle = `padding:28px;color:#2b1b2a;`
  const rowStyle = `display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0e0e8;font-size:14px;`

  if (professional?.email) {
    await transporter.sendMail({
      from,
      to: professional.email,
      subject: `Novo agendamento — ${serviceName} — ${dateStr}`,
      html: `<div style="${sharedStyle}">
        <div style="${headerStyle}">
          <h2 style="margin:0;font-size:22px;">Novo agendamento 📅</h2>
          <p style="margin:8px 0 0;opacity:.85">Sobrancelhas Express · ${unitLabel}</p>
        </div>
        <div style="${bodyStyle}">
          <p>Olá <strong>${professional.name}</strong>,</p>
          <p>Tem um novo agendamento marcado:</p>
          <div style="${rowStyle}"><span><strong>Serviço</strong></span><span>${serviceName}</span></div>
          <div style="${rowStyle}"><span><strong>Cliente</strong></span><span>${client?.name || 'Não identificado'}</span></div>
          <div style="${rowStyle}"><span><strong>Data</strong></span><span>${dateStr}</span></div>
          <div style="${rowStyle}"><span><strong>Hora</strong></span><span>${timeStr}</span></div>
          <div style="${rowStyle}border:none;"><span><strong>Unidade</strong></span><span>${unitLabel}</span></div>
          <p style="margin-top:24px;font-size:13px;color:#8f6e7d;">Este email foi gerado automaticamente pelo sistema Sobrancelhas Express.</p>
        </div>
      </div>`,
    }).catch(() => {})
  }

  if (client?.email) {
    await transporter.sendMail({
      from,
      to: client.email,
      subject: `Agendamento confirmado — ${serviceName}`,
      html: `<div style="${sharedStyle}">
        <div style="${headerStyle}">
          <h2 style="margin:0;font-size:22px;">Agendamento confirmado ✅</h2>
          <p style="margin:8px 0 0;opacity:.85">Sobrancelhas Express · ${unitLabel}</p>
        </div>
        <div style="${bodyStyle}">
          <p>Olá <strong>${client.name}</strong>,</p>
          <p>O seu agendamento foi confirmado com sucesso!</p>
          <div style="${rowStyle}"><span><strong>Serviço</strong></span><span>${serviceName}</span></div>
          <div style="${rowStyle}"><span><strong>Profissional</strong></span><span>${professional?.name || 'A definir'}</span></div>
          <div style="${rowStyle}"><span><strong>Data</strong></span><span>${dateStr}</span></div>
          <div style="${rowStyle}"><span><strong>Hora</strong></span><span>${timeStr}</span></div>
          <div style="${rowStyle}border:none;"><span><strong>Unidade</strong></span><span>${unitLabel}</span></div>
          <p style="margin-top:20px;font-size:13px;color:#8f6e7d;">
            Se precisar de alterar ou cancelar, entre em contacto connosco.<br>
            Até breve! 💕
          </p>
        </div>
      </div>`,
    }).catch(() => {})
  }
}

// Funcao exportada: create
export const create = async (req, res) => {
  try {
    const {
      professionalId,
      startTime,
      endTime,
      durationMinutes,
      notes,
      clientId,
      serviceId,
      unit
    } = req.body

    if (!professionalId || !startTime) {
      return res.status(400).json({ message: 'professionalId e startTime sao obrigatorios' })
    }

    const start = parseDate(startTime)
    if (!start) {
      return res.status(400).json({ message: 'startTime invalido' })
    }

    let end = null
    if (endTime) {
      end = parseDate(endTime)
      if (!end) {
        return res.status(400).json({ message: 'endTime invalido' })
      }
    } else if (durationMinutes) {
      const minutes = Number(durationMinutes)
      if (!Number.isFinite(minutes) || minutes <= 0) {
        return res.status(400).json({ message: 'durationMinutes invalido' })
      }
      end = new Date(start.getTime() + minutes * 60 * 1000)
    } else if (serviceId) {
      const service = await findServiceById(serviceId)
      if (!service) {
        return res.status(404).json({ message: 'Servico nao encontrado' })
      }
      if (!service.durationMinutes || service.durationMinutes <= 0) {
        return res.status(400).json({ message: 'Servico sem duracao valida' })
      }
      const durationToUse = service.maxDurationMinutes || service.durationMinutes
      end = new Date(start.getTime() + durationToUse * 60 * 1000)
    } else {
      return res
        .status(400)
        .json({ message: 'endTime ou durationMinutes e obrigatorio' })
    }

    if (start >= end) {
      return res.status(400).json({ message: 'startTime deve ser menor que endTime' })
    }

    if (req.user?.role === 'profissional' && professionalId !== req.user.id) {
      return res.status(403).json({ message: 'Profissional nao pode criar para outra agenda' })
    }

    const conflict = await findConflictingAppointment(professionalId, start, end)
    if (conflict) {
      return res.status(409).json({ message: 'Horario em conflito' })
    }

    const resolvedClientId =
      req.user?.role === 'cliente' ? req.user.id : clientId

    if (!resolvedClientId) {
      return res.status(400).json({ message: 'clientId e obrigatorio para admin/profissional' })
    }

    if (unit && !VALID_UNITS.includes(unit)) {
      return res.status(400).json({ message: 'Unidade invalida' })
    }

    const appointment = await createAppointment({
      client: resolvedClientId,
      professional: professionalId,
      service: serviceId || null,
      startTime: start,
      endTime: end,
      notes,
      unit: unit || 'cascais'
    })

    // Notificar profissional e admins sobre novo agendamento
    const unitLabel = (unit || 'cascais') === 'cascais' ? 'Cascais' : 'Almada'
    const dateLabel = start.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeLabel = `${pad(start.getHours())}:${pad(start.getMinutes())}`

    const notifTitle = 'Novo agendamento'
    const notifMessage = `Novo agendamento marcado para ${dateLabel} às ${timeLabel} na unidade de ${unitLabel}.`

    const admins = await listUsers({ role: 'admin' })
    const recipients = new Set([professionalId, ...admins.map(a => String(a._id))])

    await Promise.allSettled(
      [...recipients].map(userId =>
        createNotification({ user: userId, title: notifTitle, message: notifMessage })
      )
    )

    // Enviar emails ao profissional e ao cliente
    const [professionalUser, clientUser, serviceDoc] = await Promise.all([
      findUserById(professionalId).catch(() => null),
      findUserById(resolvedClientId).catch(() => null),
      serviceId ? findServiceById(serviceId).catch(() => null) : Promise.resolve(null),
    ])
    sendAppointmentEmails({
      professional: professionalUser,
      client: clientUser,
      service: serviceDoc,
      start,
      unit: unit || 'cascais',
    })

    res.status(201).json({ appointment })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento' })
  }
}

// Funcao exportada: listByProfessional
export const listByProfessional = async (req, res) => {
  try {
    const { professionalId } = req.params

    if (req.user.role === 'profissional' && professionalId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para ver outra agenda' })
    }

    const appointments = await listAppointmentsByProfessional(professionalId)
    res.json({ appointments })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar agendamentos' })
  }
}

// Funcao exportada: listByClient
export const listByClient = async (req, res) => {
  try {
    const { clientId } = req.params

    if (req.user.role === 'cliente' && clientId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para ver outro cliente' })
    }

    const appointments = await listAppointmentsByClient(clientId)
    res.json({ appointments })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar agendamentos' })
  }
}

// Funcao exportada: updateStatus
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, serviceId } = req.body

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status invalido' })
    }

    const existing = await findAppointmentById(id)
    if (!existing) {
      return res.status(404).json({ message: 'Agendamento nao encontrado' })
    }

    if (req.user.role === 'profissional' && String(existing.professional) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para este agendamento' })
    }

    const appointment = await updateAppointmentStatus(id, status)
    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento nao encontrado' })
    }

    if (status === 'completed') {
      const existingFinancial = await findFinancialByAppointment(id)
      if (!existingFinancial) {
        let amount = 0
        if (serviceId) {
          const service = await findServiceById(serviceId)
          if (service) {
            amount = service.price
          }
        }

        await createFinancial({
          appointment: id,
          professional: appointment.professional,
          amount,
          notes: serviceId ? 'Auto gerado pelo fechamento' : 'Auto gerado (sem servico)'
        })
      }
    }

    res.json({ appointment })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status' })
  }
}

// Funcao exportada: listAll
export const listAll = async (_req, res) => {
  try {
    const appointments = await listAllAppointments()
    res.json({ appointments })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar agendamentos' })
  }
}

// Funcao exportada: listCalendarPublic
export const listCalendarPublic = async (_req, res) => {
  try {
    const appointments = await listAllAppointments()
    res.json({ appointments })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar eventos do calendario' })
  }
}

// Funcao exportada: update
export const update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      professionalId,
      clientId,
      serviceId,
      startTime,
      notes,
      status,
      unit
    } = req.body

    const existing = await findAppointmentById(id)
    if (!existing) {
      return res.status(404).json({ message: 'Agendamento nao encontrado' })
    }

    if (!professionalId || !clientId || !serviceId || !startTime) {
      return res.status(400).json({ message: 'Preencha todos os campos' })
    }

    const start = new Date(startTime)
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: 'startTime invalido' })
    }

    const service = await findServiceById(serviceId)
    if (!service || !service.durationMinutes) {
      return res.status(400).json({ message: 'Servico sem duracao valida' })
    }

    const durationToUse = service.maxDurationMinutes || service.durationMinutes
    const end = new Date(start.getTime() + durationToUse * 60 * 1000)

    const conflict = await findConflictingAppointmentExcluding(
      id,
      professionalId,
      start,
      end
    )
    if (conflict) {
      return res.status(409).json({ message: 'Horario em conflito' })
    }

    if (unit && !VALID_UNITS.includes(unit)) {
      return res.status(400).json({ message: 'Unidade invalida' })
    }

    const updated = await updateAppointment(id, {
      professional: professionalId,
      client: clientId,
      service: serviceId,
      startTime: start,
      endTime: end,
      notes: notes || '',
      status: ['scheduled', 'completed', 'cancelled'].includes(status) ? status : existing.status,
      unit: unit || existing.unit || 'cascais'
    })

    res.json({ appointment: updated })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento' })
  }
}

