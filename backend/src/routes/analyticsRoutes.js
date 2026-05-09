import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import * as analyticsController from '../controllers/analyticsController.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

router.get('/overview', analyticsController.getAnalyticsOverview)

export default router
