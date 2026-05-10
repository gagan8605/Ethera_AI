import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { registerNotificationClient } from '../utils/realtime.js'

const router = express.Router()

router.get('/notifications', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  res.flushHeaders?.()
  res.write('retry: 5000\n\n')
  res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.user.id })}\n\n`)

  const removeClient = registerNotificationClient(req.user.id, res)

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': keep-alive\n\n')
    }
  }, 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    removeClient()
    res.end()
  })
})

export default router