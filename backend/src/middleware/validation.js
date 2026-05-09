import { validationResult, body, param, query } from 'express-validator'

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formattedErrors = {}
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg
    })
    return res.status(400).json({ errors: formattedErrors })
  }
  next()
}

// Auth validations
export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number')
]

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
]

export const validateUpdateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('avatar').optional().isString()
]

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number')
]

// Project validations
export const validateCreateProject = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
]

export const validateUpdateProject = [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('status').optional().isIn(['ACTIVE', 'ARCHIVED', 'COMPLETED']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
]

export const validateAddMember = [
  body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('role').isIn(['MEMBER', 'ADMIN', 'VIEWER']).withMessage('Invalid role')
]

export const validateUpdateMemberRole = [
  body('role').isIn(['MEMBER', 'ADMIN', 'VIEWER']).withMessage('Invalid role')
]

// Task validations
export const validateCreateTask = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
]

export const validateUpdateTask = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('assigneeId').optional().isString().withMessage('Invalid assignee ID'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
]

export const validateCreateComment = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
]

export const validateQueryFilters = [
  query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  query('assigneeId').optional().isString(),
  query('search').optional().trim(),
  query('overdue').optional().isBoolean()
]

// Communication validations
export const validateSendMessage = [
  body('recipientId').trim().isString().withMessage('Recipient is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
]

export const validateSupportRequest = [
  body('subject').trim().isLength({ min: 3, max: 120 }).withMessage('Subject must be between 3 and 120 characters'),
  body('category').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Invalid category'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
]
