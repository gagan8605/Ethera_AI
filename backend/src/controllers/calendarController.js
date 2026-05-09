import prisma from '../utils/db.js'
import { asyncHandler } from '../utils/helpers.js'

const getAccessibleProjectsWhere = (userId) => ({
  OR: [
    { ownerId: userId },
    { members: { some: { userId } } }
  ]
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

  const events = [...taskEvents, ...projectEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  const today = new Date()
  const upcoming = events.filter((event) => new Date(event.date) >= new Date(today.setHours(0, 0, 0, 0)))

  res.json({
    summary: {
      totalEvents: events.length,
      upcomingEvents: upcoming.length,
      taskEvents: taskEvents.length,
      projectDeadlines: projectEvents.length
    },
    events
  })
})
