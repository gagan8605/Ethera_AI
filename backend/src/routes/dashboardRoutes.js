import express from 'express'
import * as dashboardController from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

router.get('/stats', dashboardController.getDashboardStats)
router.get('/my-tasks', dashboardController.getMyTasks)
router.get('/activity', dashboardController.getActivityFeed)
router.get('/overdue', dashboardController.getOverdueTasks)
router.get('/completion-stats', dashboardController.getTasksCompletionStats)
router.get('/status-chart', dashboardController.getTasksByStatusChart)
router.get('/completed-daily', dashboardController.getTasksCompletedDaily)

export default router
