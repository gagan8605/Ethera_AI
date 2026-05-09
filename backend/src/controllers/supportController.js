import prisma from '../utils/db.js'
import { asyncHandler, logActivity } from '../utils/helpers.js'

export const submitSupportRequest = asyncHandler(async (req, res) => {
  const { subject, category, message } = req.body

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true }
  })

  const ticketId = `SUP-${Date.now()}`
  const notificationMessage = `Support request ${ticketId} from ${req.user.name}: ${subject} (${category})`

  await Promise.all([
    ...admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SUPPORT_REQUEST',
          message: `${notificationMessage} - ${message}`,
          link: '/admin'
        }
      })
    ),
    prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'SUPPORT_CONFIRMATION',
        message: `We received your support request ${ticketId}. Our team will review it soon.`,
        link: '/support'
      }
    })
  ])

  await logActivity(prisma, req.user.id, 'SUBMIT_SUPPORT', 'SUPPORT', ticketId, null, null, {
    subject,
    category
  })

  res.status(201).json({
    message: 'Support request submitted successfully',
    ticketId
  })
})
