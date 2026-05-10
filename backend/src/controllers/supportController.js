import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity, createNotificationRecord } from '../utils/helpers.js'
import { emitNotificationEvent } from '../utils/realtime.js'

const ticketListInclude = {
  requester: { select: { id: true, name: true, email: true, role: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  _count: { select: { comments: true } }
}

const ticketDetailInclude = {
  requester: { select: { id: true, name: true, email: true, role: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  comments: {
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  },
  _count: { select: { comments: true } }
}

const supportStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']
const supportPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '')

const isAdmin = (user) => user?.role === 'ADMIN'

const buildTicketNumber = () => {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SUP-${Date.now()}-${suffix}`
}

const computeSummary = (tickets) => tickets.reduce(
  (summary, ticket) => {
    summary.total += 1
    summary[ticket.status.toLowerCase()] = (summary[ticket.status.toLowerCase()] || 0) + 1
    summary[ticket.priority.toLowerCase()] = (summary[ticket.priority.toLowerCase()] || 0) + 1
    return summary
  },
  {
    total: 0,
    open: 0,
    in_progress: 0,
    waiting_for_customer: 0,
    resolved: 0,
    closed: 0,
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0
  }
)

const getAdminIds = async () => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  })

  return admins.map((admin) => admin.id)
}

const createNotifications = async (userIds, data) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))]

  if (!uniqueUserIds.length) {
    return
  }

  await Promise.all(
    uniqueUserIds.map((userId) =>
      createNotificationRecord(prisma, {
        userId,
        ...data
      }).then((notification) => {
        emitNotificationEvent(userId, { type: data.type, notification })
        return notification
      })
    )
  )
}

const getTicketForUser = async (ticketId, user) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: ticketDetailInclude
  })

  if (!ticket) {
    throw new ApiError(404, 'Support ticket not found')
  }

  if (!isAdmin(user) && ticket.requesterId !== user.id) {
    throw new ApiError(404, 'Support ticket not found')
  }

  return ticket
}

const getAdminTicketLink = (ticketId) => `/admin?ticket=${ticketId}`
const getSupportTicketLink = (ticketId) => `/support?ticket=${ticketId}`

const getTicketLabel = (ticket) => `${ticket.ticketNumber} • ${ticket.subject}`

export const submitSupportRequest = asyncHandler(async (req, res) => {
  const subject = normalizeText(req.body.subject)
  const category = normalizeText(req.body.category) || 'General'
  const message = normalizeText(req.body.message)
  const screenshots = Array.isArray(req.body.screenshots) ? req.body.screenshots.filter(Boolean).map(normalizeText).filter(Boolean) : []
  const priority = normalizeText(req.body.priority).toUpperCase()

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: buildTicketNumber(),
      subject,
      category,
      message,
      screenshots,
      priority: supportPriorities.includes(priority) ? priority : 'MEDIUM',
      requesterId: req.user.id
    },
    include: ticketDetailInclude
  })

  const adminIds = await getAdminIds()
  const requesterNotification = {
    type: 'SUPPORT_CONFIRMATION',
    message: `Your support ticket ${ticket.ticketNumber} has been created. Our team will review it soon.`,
    link: getSupportTicketLink(ticket.id)
  }
  const adminNotification = {
    type: 'SUPPORT_REQUEST',
    message: `New support ticket ${getTicketLabel(ticket)} from ${req.user.name} (${category})`,
    link: getAdminTicketLink(ticket.id)
  }

  await Promise.all([
    createNotifications(adminIds, adminNotification),
    createNotificationRecord(prisma, {
      userId: req.user.id,
      ...requesterNotification
    }).then((notification) => {
      emitNotificationEvent(req.user.id, { type: requesterNotification.type, notification })
      return notification
    })
  ])

  await logActivity(prisma, req.user.id, 'SUBMIT_SUPPORT', 'SUPPORT_TICKET', ticket.id, null, null, {
    ticketNumber: ticket.ticketNumber,
    subject,
    category,
    priority: ticket.priority,
    screenshotsCount: screenshots.length
  })

  res.status(201).json({
    message: 'Support request submitted successfully',
    ticket
  })
})

export const listSupportTickets = asyncHandler(async (req, res) => {
  const scope = normalizeText(req.query.scope).toLowerCase() || (isAdmin(req.user) ? 'all' : 'mine')
  const status = normalizeText(req.query.status).toUpperCase()
  const category = normalizeText(req.query.category)
  const search = normalizeText(req.query.search)

  const where = {}

  if (!isAdmin(req.user) || scope === 'mine') {
    where.requesterId = req.user.id
  }

  if (status) {
    where.status = status
  }

  if (category) {
    where.category = {
      contains: category,
      mode: 'insensitive'
    }
  }

  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } }
    ]
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: ticketListInclude,
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
  })

  res.json({
    tickets,
    summary: computeSummary(tickets),
    scope: isAdmin(req.user) ? scope : 'mine'
  })
})

export const getSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await getTicketForUser(req.params.ticketId, req.user)
  res.json({ ticket })
})

export const addSupportTicketComment = asyncHandler(async (req, res) => {
  const content = normalizeText(req.body.content)

  if (!content) {
    throw new ApiError(400, 'Comment is required')
  }

  const ticket = await getTicketForUser(req.params.ticketId, req.user)
  const now = new Date()
  const comment = await prisma.supportTicketComment.create({
    data: {
      ticketId: ticket.id,
      authorId: req.user.id,
      content
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } }
    }
  })

  const updateData = {
    lastRespondedAt: now
  }

  if (isAdmin(req.user) && ticket.status === 'OPEN') {
    updateData.status = 'IN_PROGRESS'
  }

  if (!isAdmin(req.user) && ['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    updateData.status = 'OPEN'
    updateData.resolvedAt = null
    updateData.closedAt = null
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: updateData,
    include: ticketDetailInclude
  })

  const recipientIds = isAdmin(req.user)
    ? [ticket.requesterId]
    : ticket.assignedToId
      ? [ticket.assignedToId]
      : await getAdminIds()

  await createNotifications(recipientIds, {
    type: 'SUPPORT_COMMENT',
    message: `${req.user.name} added a comment on support ticket ${ticket.ticketNumber}`,
    link: isAdmin(req.user) ? getSupportTicketLink(ticket.id) : getAdminTicketLink(ticket.id)
  })

  await logActivity(prisma, req.user.id, 'COMMENT_SUPPORT', 'SUPPORT_TICKET', ticket.id, null, null, {
    ticketNumber: ticket.ticketNumber,
    content
  })

  res.status(201).json({
    message: 'Comment added successfully',
    comment,
    ticket: updatedTicket
  })
})

export const updateSupportTicketStatus = asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) {
    throw new ApiError(403, 'Admin access required')
  }

  const status = normalizeText(req.body.status).toUpperCase()

  if (!supportStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status')
  }

  const ticket = await getTicketForUser(req.params.ticketId, req.user)
  const now = new Date()
  const updateData = {
    status,
    lastRespondedAt: now
  }

  if (status === 'RESOLVED') {
    updateData.resolvedAt = now
  }

  if (status === 'CLOSED') {
    updateData.closedAt = now
  }

  if (status === 'OPEN') {
    updateData.resolvedAt = null
    updateData.closedAt = null
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: updateData,
    include: ticketDetailInclude
  })

  await Promise.all([
    createNotificationRecord(prisma, {
      userId: ticket.requesterId,
      type: 'SUPPORT_STATUS_CHANGED',
      message: `Support ticket ${ticket.ticketNumber} is now ${status.replaceAll('_', ' ')}`,
      link: getSupportTicketLink(ticket.id)
    }).then((notification) => {
      emitNotificationEvent(ticket.requesterId, { type: 'SUPPORT_STATUS_CHANGED', notification })
      return notification
    }),
    ...(ticket.assignedToId
      ? [
          createNotificationRecord(prisma, {
            userId: ticket.assignedToId,
            type: 'SUPPORT_STATUS_CHANGED',
            message: `Support ticket ${ticket.ticketNumber} is now ${status.replaceAll('_', ' ')}`,
            link: getAdminTicketLink(ticket.id)
          }).then((notification) => {
            emitNotificationEvent(ticket.assignedToId, { type: 'SUPPORT_STATUS_CHANGED', notification })
            return notification
          })
        ]
      : [])
  ])

  await logActivity(prisma, req.user.id, 'UPDATE_SUPPORT_STATUS', 'SUPPORT_TICKET', ticket.id, null, null, {
    ticketNumber: ticket.ticketNumber,
    status
  })

  res.json({
    message: 'Support ticket status updated successfully',
    ticket: updatedTicket
  })
})

export const assignSupportTicket = asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) {
    throw new ApiError(403, 'Admin access required')
  }

  const assignedToId = normalizeText(req.body.assignedToId) || req.user.id
  const assignee = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      role: 'ADMIN'
    },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!assignee) {
    throw new ApiError(404, 'Assigned admin not found')
  }

  const ticket = await getTicketForUser(req.params.ticketId, req.user)
  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      assignedToId: assignee.id,
      status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
      lastRespondedAt: new Date()
    },
    include: ticketDetailInclude
  })

  await Promise.all([
    createNotificationRecord(prisma, {
      userId: ticket.requesterId,
      type: 'SUPPORT_ASSIGNED',
      message: `Support ticket ${ticket.ticketNumber} has been assigned to ${assignee.name}`,
      link: getSupportTicketLink(ticket.id)
    }).then((notification) => {
      emitNotificationEvent(ticket.requesterId, { type: 'SUPPORT_ASSIGNED', notification })
      return notification
    }),
    createNotificationRecord(prisma, {
      userId: assignee.id,
      type: 'SUPPORT_ASSIGNED',
      message: `Support ticket ${ticket.ticketNumber} has been assigned to you`,
      link: getAdminTicketLink(ticket.id)
    }).then((notification) => {
      emitNotificationEvent(assignee.id, { type: 'SUPPORT_ASSIGNED', notification })
      return notification
    })
  ])

  await logActivity(prisma, req.user.id, 'ASSIGN_SUPPORT_TICKET', 'SUPPORT_TICKET', ticket.id, null, null, {
    ticketNumber: ticket.ticketNumber,
    assignedTo: assignee.id
  })

  res.json({
    message: 'Support ticket assigned successfully',
    ticket: updatedTicket
  })
})