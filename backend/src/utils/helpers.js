export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const logActivity = async (prisma, userId, action, entity, entityId, projectId = null, taskId = null, metadata = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        projectId,
        taskId,
        metadata
      }
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

export const createNotificationRecord = async (prisma, data) => {
  return prisma.notification.create({
    data
  })
}
