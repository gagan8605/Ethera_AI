import express from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { handleValidationErrors, validateRegister, validateLogin, validateUpdateProfile, validateChangePassword, validateDeactivateAccount, validateActivateAccount, validateDeleteAccount } from '../middleware/validation.js'

const router = express.Router()

router.post('/register', validateRegister, handleValidationErrors, authController.register)
router.post('/login', validateLogin, handleValidationErrors, authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getCurrentUser)
router.put('/me', authenticate, validateUpdateProfile, handleValidationErrors, authController.updateProfile)
router.put('/me/password', authenticate, validateChangePassword, handleValidationErrors, authController.changePassword)
router.put('/me/deactivate', authenticate, validateDeactivateAccount, handleValidationErrors, authController.deactivateAccount)
router.put('/me/activate', authenticate, validateActivateAccount, handleValidationErrors, authController.activateAccount)
router.delete('/me', authenticate, validateDeleteAccount, handleValidationErrors, authController.deleteAccount)

export default router
