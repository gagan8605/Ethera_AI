import express from 'express'
import { authenticate } from '../middleware/auth.js'
import * as calendarController from '../controllers/calendarController.js'

const router = express.Router()

router.use(authenticate)

router.get('/events', calendarController.getCalendarEvents)

export default router
