import express from 'express'
import * as userController from '../controllers/userController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

router.get('/', requireAdmin, userController.listUsers)
router.get('/:id', userController.getUser)

export default router
