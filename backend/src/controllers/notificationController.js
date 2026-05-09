import prisma from '../utils/db.js'
import { ApiError, asyncHandler } from '../utils/helpers.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
    take: 20
  })

  res.json(notifications)
})

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params

  const notification = await prisma.notification.findUnique({
    where: { id }
  })

  if (!notification || notification.userId !== req.user.id) {
    throw new ApiError(404, 'Notification not found')
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true }
  })

  res.json(updated)
})

export const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id },
    data: { read: true }
  })

  res.json({ message: 'All notifications marked as read' })
})

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params

  const notification = await prisma.notification.findUnique({
    where: { id }
  })

  if (!notification || notification.userId !== req.user.id) {
    throw new ApiError(404, 'Notification not found')
  }

  await prisma.notification.delete({
    where: { id }
  })

  res.json({ message: 'Notification deleted successfully' })
})

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: {
      userId: req.user.id,
      read: false
    }
  })

  res.json({ unreadCount: count })
})
