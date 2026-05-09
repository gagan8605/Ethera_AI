import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import * as teamController from '../controllers/teamController.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

router.get('/', teamController.getTeamOverview)

export default router
