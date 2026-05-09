import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { handleValidationErrors, validateSupportRequest } from '../middleware/validation.js'
import * as supportController from '../controllers/supportController.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

router.post('/', validateSupportRequest, handleValidationErrors, supportController.submitSupportRequest)

export default router
