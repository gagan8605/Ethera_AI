import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/auth.js'
import {
	handleValidationErrors,
	validateSupportRequest,
	validateSupportTicketList,
	validateSupportTicketComment,
	validateSupportTicketStatus,
	validateSupportTicketAssignment
} from '../middleware/validation.js'
import * as supportController from '../controllers/supportController.js'

const router = express.Router()

router.use(authenticate)

router.post('/', validateSupportRequest, handleValidationErrors, supportController.submitSupportRequest)
router.get('/tickets', validateSupportTicketList, handleValidationErrors, supportController.listSupportTickets)
router.get('/tickets/:ticketId', supportController.getSupportTicket)
router.post('/tickets/:ticketId/comments', validateSupportTicketComment, handleValidationErrors, supportController.addSupportTicketComment)
router.patch('/tickets/:ticketId/status', requireAdmin, validateSupportTicketStatus, handleValidationErrors, supportController.updateSupportTicketStatus)
router.patch('/tickets/:ticketId/assign', requireAdmin, validateSupportTicketAssignment, handleValidationErrors, supportController.assignSupportTicket)

export default router
