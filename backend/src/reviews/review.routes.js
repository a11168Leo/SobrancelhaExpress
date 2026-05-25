import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { createReview, listReviews, myReviewedAppointments } from './review.controller.js'

const router = Router()

router.get('/', listReviews)
router.get('/mine', authMiddleware, myReviewedAppointments)
router.post('/', authMiddleware, createReview)

export default router
