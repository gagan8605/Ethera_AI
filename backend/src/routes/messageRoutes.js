import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { handleValidationErrors } from '../middleware/validation.js'
import { validateSendMessage } from '../middleware/validation.js'
import * as messageController from '../controllers/messageController.js'

const router = express.Router()

router.use(authenticate)

router.get('/', messageController.listMessages)
router.post('/', validateSendMessage, handleValidationErrors, messageController.sendMessage)

export default router
