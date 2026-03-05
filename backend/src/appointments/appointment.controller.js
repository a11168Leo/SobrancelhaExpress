
/*
====================
SECAO INTERNA PADRAO
====================
*/

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




const parseDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}




export const create = async (req, res) => {
  try {
    const {
      professionalId,
      startTime,
      endTime,
      durationMinutes,
      notes,
      clientId,
      serviceId
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

    if (req.user.role === 'profissional' && professionalId !== req.user.id) {
      return res.status(403).json({ message: 'Profissional nao pode criar para outra agenda' })
    }

    const conflict = await findConflictingAppointment(professionalId, start, end)
    if (conflict) {
      return res.status(409).json({ message: 'Horario em conflito' })
    }

    const resolvedClientId =
      req.user.role === 'cliente' ? req.user.id : clientId

    if (!resolvedClientId) {
      return res.status(400).json({ message: 'clientId e obrigatorio para admin/profissional' })
    }

    const appointment = await createAppointment({
      client: resolvedClientId,
      professional: professionalId,
      service: serviceId || null,
      startTime: start,
      endTime: end,
      notes
    })

    res.status(201).json({ appointment })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar agendamento' })
  }
}




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




export const listAll = async (_req, res) => {
  try {
    const appointments = await listAllAppointments()
    res.json({ appointments })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar agendamentos' })
  }
}




export const update = async (req, res) => {
  try {
    const { id } = req.params
    const { professionalId, clientId, serviceId, startTime } = req.body

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

    const updated = await updateAppointment(id, {
      professional: professionalId,
      client: clientId,
      service: serviceId,
      startTime: start,
      endTime: end
    })

    res.json({ appointment: updated })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento' })
  }
}





