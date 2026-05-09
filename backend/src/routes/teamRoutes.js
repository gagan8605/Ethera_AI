import express from 'express'
import { authenticate } from '../middleware/auth.js'
import * as teamController from '../controllers/teamController.js'

const router = express.Router()

router.use(authenticate)

router.get('/', teamController.getTeamOverview)

export default router
