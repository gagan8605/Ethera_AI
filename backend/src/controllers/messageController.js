import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity, createNotificationRecord } from '../utils/helpers.js'
import { emitNotificationEvent } from '../utils/realtime.js'

export const listMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
      type: { in: ['MESSAGE', 'SENT_MESSAGE'] }
    },
    orderBy: { createdAt: 'desc' },
    take: 30
  })

  res.json(messages)
})

export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!recipient) {
    throw new ApiError(404, 'Recipient not found')
  }

  const receivedMessage = await createNotificationRecord(prisma, {
    userId: recipient.id,
    type: 'MESSAGE',
    message: `Message from ${req.user.name}: ${content}`,
    link: '/messages'
  })

  emitNotificationEvent(recipient.id, { type: 'MESSAGE', notification: receivedMessage })

  const sentMessage = await createNotificationRecord(prisma, {
    userId: req.user.id,
    type: 'SENT_MESSAGE',
    message: `Message sent to ${recipient.name}: ${content}`,
    link: '/messages'
  })

  emitNotificationEvent(req.user.id, { type: 'SENT_MESSAGE', notification: sentMessage })

  await logActivity(prisma, req.user.id, 'SEND_MESSAGE', 'MESSAGE', receivedMessage.id, null, null, {
    recipientId: recipient.id
  })

  res.status(201).json({
    message: 'Message sent successfully',
    id: receivedMessage.id
  })
})
