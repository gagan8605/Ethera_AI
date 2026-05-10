import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity } from '../utils/helpers.js'
import { createNotificationRecord } from '../utils/helpers.js'
import { emitNotificationEvent } from '../utils/realtime.js'

const getAccessibleProjectsWhere = (userId) => ({
  OR: [
    { ownerId: userId },
    { members: { some: { userId } } }
  ]
})

const getAccessibleProjectIds = async (userId) => {
  const projects = await prisma.project.findMany({
    where: getAccessibleProjectsWhere(userId),
    select: { id: true }
  })

  return projects.map((project) => project.id)
}

export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, startAt, endAt, location, projectId } = req.body

  const projectIds = await getAccessibleProjectIds(req.user.id)
  const canAttachToProject = !projectId || projectIds.includes(projectId)

  if (!canAttachToProject) {
    throw new ApiError(403, 'Access denied')
  }

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description: description || null,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      location: location || null,
      projectId: projectId || null,
      createdById: req.user.id
    },
    include: {
      project: { select: { id: true, name: true, color: true, status: true } },
      createdBy: { select: { id: true, name: true, avatar: true } }
    }
  })

  const recipientIds = new Set([req.user.id])

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true, owner: true }
    })

    if (project) {
      recipientIds.add(project.ownerId)
      project.members.forEach((member) => recipientIds.add(member.userId))
    }
  }

  await Promise.all(
    [...recipientIds].map(async (userId) => {
      const notification = await createNotificationRecord(prisma, {
        userId,
        type: 'MEETING_CREATED',
        message: `Meeting scheduled: ${title}`,
        link: '/calendar'
      })

      emitNotificationEvent(userId, { type: 'MEETING_CREATED', notification })
    })
  )

  await logActivity(prisma, req.user.id, 'CREATE_MEETING', 'MEETING', meeting.id, projectId || null, null, {
    title,
    startAt,
    endAt,
    location
  })

  res.status(201).json({ meeting })
})

export const getCalendarEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const projects = await prisma.project.findMany({
    where: getAccessibleProjectsWhere(userId),
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } }
    },
    orderBy: { dueDate: 'asc' }
  })

  const projectIds = projects.map((project) => project.id)

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      dueDate: { not: null }
    },
    include: {
      project: { select: { id: true, name: true, color: true, status: true } },
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { dueDate: 'asc' }
  })

  const taskEvents = tasks.map((task) => ({
    id: task.id,
    type: 'TASK',
    title: task.title,
    date: task.dueDate,
    project: task.project,
    assignee: task.assignee,
    creator: task.creator,
    status: task.status,
    priority: task.priority,
    tags: task.tags
  }))

  const projectEvents = projects
    .filter((project) => project.dueDate)
    .map((project) => ({
      id: project.id,
      type: 'PROJECT',
      title: `${project.name} deadline`,
      date: project.dueDate,
      project: {
        id: project.id,
        name: project.name,
        color: project.color,
        status: project.status
      },
      owner: project.owner
    }))

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [
        { createdById: userId },
        { projectId: { in: projectIds } },
        { projectId: null }
      ]
    },
    include: {
      project: { select: { id: true, name: true, color: true, status: true } },
      createdBy: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { startAt: 'asc' }
  })

  const meetingEvents = meetings.map((meeting) => ({
    id: meeting.id,
    type: 'MEETING',
    title: meeting.title,
    date: meeting.startAt,
    endAt: meeting.endAt,
    project: meeting.project,
    createdBy: meeting.createdBy,
    location: meeting.location,
    description: meeting.description,
    status: 'SCHEDULED'
  }))

  const events = [...taskEvents, ...projectEvents, ...meetingEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  const today = new Date()
  const upcoming = events.filter((event) => new Date(event.date) >= new Date(today.setHours(0, 0, 0, 0)))

  res.json({
    summary: {
      totalEvents: events.length,
      upcomingEvents: upcoming.length,
      taskEvents: taskEvents.length,
      projectDeadlines: projectEvents.length,
      milestoneEvents: projectEvents.length,
      meetingEvents: meetingEvents.length
    },
    events
  })
})
