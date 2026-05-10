import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import * as calendarController from '../controllers/calendarController.js'
import { handleValidationErrors, validateCreateMeeting } from '../middleware/validation.js'

const router = express.Router()

router.use(authenticate)

router.get('/events', calendarController.getCalendarEvents)
router.post('/meetings', requireAdmin, validateCreateMeeting, handleValidationErrors, calendarController.createMeeting)

export default router
