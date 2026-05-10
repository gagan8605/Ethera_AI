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

export const validateDeactivateAccount = [
  body('password').notEmpty().withMessage('Password is required to deactivate account')
]

export const validateActivateAccount = [
  body('password').notEmpty().withMessage('Password is required to activate account')
]

export const validateDeleteAccount = [
  body('password').notEmpty().withMessage('Password is required to delete account'),
  body('confirmDelete').equals('DELETE').withMessage('Please type "DELETE" to confirm account deletion')
]

// Project validations
export const validateCreateProject = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters'),
  body('team').trim().isLength({ min: 2, max: 100 }).withMessage('Team is required'),
  body('projectManagerId').trim().isString().withMessage('Project manager is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date is required')
    .custom((value) => {
      const startDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        throw new Error('Start date must be today or in the future')
      }

      return true
    }),
  body('deadline')
    .isISO8601()
    .withMessage('Deadline is required')
    .custom((value, { req }) => {
      const deadline = new Date(value)
      const startDate = new Date(req.body.startDate)

      if (Number.isNaN(deadline.getTime())) {
        throw new Error('Invalid deadline date')
      }

      if (deadline <= startDate) {
        throw new Error('Deadline must be after start date')
      }

      return true
    }),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  body('clientName').optional().trim().isLength({ max: 100 }).withMessage('Client name must be less than 100 characters'),
  body('visibility').optional().isIn(['PRIVATE', 'TEAM', 'PUBLIC']).withMessage('Invalid visibility'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
]

export const validateUpdateProject = [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('team').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Invalid team name'),
  body('projectManagerId').optional().trim().isString().withMessage('Invalid project manager'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format')
    .custom((value) => {
      const startDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        throw new Error('Start date must be today or in the future')
      }

      return true
    }),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline date format')
    .custom((value, { req }) => {
      const deadline = new Date(value)
      const startDate = req.body.startDate ? new Date(req.body.startDate) : null

      if (Number.isNaN(deadline.getTime())) {
        throw new Error('Invalid deadline date')
      }

      if (startDate && deadline <= startDate) {
        throw new Error('Deadline must be after start date')
      }

      return true
    }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  body('clientName').optional().trim().isLength({ max: 100 }).withMessage('Client name must be less than 100 characters'),
  body('visibility').optional().isIn(['PRIVATE', 'TEAM', 'PUBLIC']).withMessage('Invalid visibility'),
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
  body('dueDate')
    .isISO8601()
    .withMessage('Due date is required')
    .custom((value) => {
      const dueDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        throw new Error('Due date must be today or in the future')
      }

      return true
    }),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
]

export const validateUpdateTask = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('assigneeId').optional().isString().withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const dueDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        throw new Error('Due date must be today or in the future')
      }

      return true
    }),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
]

export const validateCreateComment = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
]

export const validateCreateMeeting = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Meeting title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('startAt').isISO8601().withMessage('Invalid start time'),
  body('endAt').optional().isISO8601().withMessage('Invalid end time'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
  body('projectId').optional().isString().withMessage('Invalid project ID')
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
  body('subject').trim().isLength({ min: 2, max: 120 }).withMessage('Subject must be between 2 and 120 characters'),
  body('category').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Invalid category'),
  body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be between 5 and 2000 characters'),
  body('screenshots').optional().isArray().withMessage('Screenshots must be an array')
]

export const validateSupportTicketList = [
  query('scope').optional().trim().isIn(['mine', 'all']).withMessage('Invalid scope'),
  query('status')
    .optional()
    .trim()
    .isIn(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'])
    .withMessage('Invalid status'),
  query('category').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Invalid category'),
  query('search').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Search must be between 2 and 120 characters')
]

export const validateSupportTicketComment = [
  body('content').trim().isLength({ min: 2, max: 2000 }).withMessage('Comment must be between 2 and 2000 characters')
]

export const validateSupportTicketStatus = [
  body('status')
    .trim()
    .isIn(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'])
    .withMessage('Invalid status')
]

export const validateSupportTicketAssignment = [
  body('assignedToId').optional().trim().isString().withMessage('Invalid assignee')
]
