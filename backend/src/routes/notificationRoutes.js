import express from 'express'
import * as notificationController from '../controllers/notificationController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

router.get('/', notificationController.getNotifications)
router.get('/unread-count', notificationController.getUnreadCount)
router.put('/:id/read', notificationController.markAsRead)
router.put('/read-all', notificationController.markAllAsRead)
router.delete('/:id', notificationController.deleteNotification)

export default router
