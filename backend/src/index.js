import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import teamRoutes from './routes/teamRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import calendarRoutes from './routes/calendarRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import supportRoutes from './routes/supportRoutes.js'
import realtimeRoutes from './routes/realtimeRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true
  }

  if (allowedOrigins.includes(origin)) {
    return true
  }

  try {
    const hostname = new URL(origin).hostname
    return hostname === 'localhost' || hostname.endsWith('.railway.app') || hostname.endsWith('.up.railway.app')
  } catch {
    return false
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))

// Request logging
app.use(morgan('combined'))

// Compression
app.use(compression())

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Rate limiting
const authLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 min (prod) / 60 min (dev)
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 requests (prod) / 100 (dev)
  message: 'Too many authentication attempts, please try again later',
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return process.env.NODE_ENV !== 'production' && req.ip === '::1'
  }
})

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/tasks', taskRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/team', teamRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/realtime', realtimeRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
