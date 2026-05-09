import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { handleValidationErrors } from '../middleware/validation.js'
import { validateSendMessage } from '../middleware/validation.js'
import * as messageController from '../controllers/messageController.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

router.get('/', messageController.listMessages)
router.post('/', validateSendMessage, handleValidationErrors, messageController.sendMessage)

export default router
