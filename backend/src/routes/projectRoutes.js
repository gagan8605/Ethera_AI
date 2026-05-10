import express from 'express'
import * as projectController from '../controllers/projectController.js'
import { authenticate, requireProjectAdmin, requireAdmin } from '../middleware/auth.js'
import { handleValidationErrors, validateCreateProject, validateUpdateProject, validateAddMember, validateUpdateMemberRole } from '../middleware/validation.js'

const router = express.Router()

router.use(authenticate)

router.get('/', projectController.listProjects)
router.post('/', validateCreateProject, handleValidationErrors, requireAdmin, projectController.createProject)
router.get('/:id', projectController.getProject)
router.put('/:id', validateUpdateProject, handleValidationErrors, requireProjectAdmin, projectController.updateProject)
router.delete('/:id', requireProjectAdmin, projectController.deleteProject)

router.get('/:id/members', projectController.getProjectMembers)
router.post('/:id/members', validateAddMember, handleValidationErrors, requireProjectAdmin, projectController.addProjectMember)
router.put('/:id/members/:userId', validateUpdateMemberRole, handleValidationErrors, requireProjectAdmin, projectController.updateMemberRole)
router.delete('/:id/members/:userId', requireProjectAdmin, projectController.removeProjectMember)

router.get('/:id/activity', projectController.getProjectActivity)

export default router
