import express from 'express'
import * as taskController from '../controllers/taskController.js'
import { authenticate, requireProjectMember } from '../middleware/auth.js'
import { handleValidationErrors, validateCreateTask, validateUpdateTask, validateCreateComment, validateQueryFilters } from '../middleware/validation.js'

const router = express.Router({ mergeParams: true })

router.use(authenticate)
router.use('/', requireProjectMember)

router.get('/', validateQueryFilters, handleValidationErrors, taskController.listTasks)
router.post('/', validateCreateTask, handleValidationErrors, taskController.createTask)
router.get('/:id', taskController.getTask)
router.put('/:id', validateUpdateTask, handleValidationErrors, taskController.updateTask)
router.delete('/:id', taskController.deleteTask)
router.put('/:id/status', taskController.updateTaskStatus)
router.post('/reorder', taskController.reorderTasks)

router.get('/:id/comments', taskController.getTaskComments)
router.post('/:id/comments', validateCreateComment, handleValidationErrors, taskController.createComment)
router.delete('/:id/comments/:commentId', taskController.deleteComment)

export default router
