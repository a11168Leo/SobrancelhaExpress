import Review from './review.model.js'
import Appointment from '../appointments/appointment.model.js'
import User from '../users/user.model.js'

export const createReview = async (req, res) => {
  try {
    const clientId = req.user.id
    const { appointmentId, rating, comment } = req.body

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: 'appointmentId e rating são obrigatórios.' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating deve ser entre 1 e 5.' })
    }

    const appt = await Appointment.findById(appointmentId)
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado.' })
    if (String(appt.client) !== clientId) return res.status(403).json({ message: 'Sem permissão.' })
    if (appt.status !== 'completed') {
      return res.status(400).json({ message: 'Só é possível avaliar agendamentos concluídos.' })
    }

    const review = await Review.create({
      client:       clientId,
      professional: appt.professional,
      appointment:  appointmentId,
      rating:       Number(rating),
      comment:      (comment || '').trim().slice(0, 500),
      unit:         appt.unit || '',
    })

    // Award +10 reward points to client
    await User.findByIdAndUpdate(clientId, { $inc: { rewardPoints: 10 } })

    const populated = await review.populate([
      { path: 'client', select: 'name avatar' },
      { path: 'professional', select: 'name avatar' },
    ])

    res.status(201).json({ review: populated })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Este agendamento já foi avaliado.' })
    }
    res.status(500).json({ message: 'Erro ao criar avaliação.' })
  }
}

export const listReviews = async (req, res) => {
  try {
    const { unit, professionalId, limit = 100 } = req.query
    const filter = { visible: true }
    if (unit) filter.unit = unit
    if (professionalId) filter.professional = professionalId

    const reviews = await Review.find(filter)
      .populate('client', 'name avatar')
      .populate('professional', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 200))

    res.json({ reviews })
  } catch {
    res.status(500).json({ message: 'Erro ao listar avaliações.' })
  }
}

export const myReviewedAppointments = async (req, res) => {
  try {
    const reviews = await Review.find({ client: req.user.id }).select('appointment rating comment createdAt')
    const reviewedAppointmentIds = reviews.map(r => String(r.appointment))
    res.json({ reviewedAppointmentIds, reviews })
  } catch {
    res.status(500).json({ message: 'Erro.' })
  }
}
