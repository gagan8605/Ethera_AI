import prisma from '../utils/db.js'
import { asyncHandler } from '../utils/helpers.js'

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const [totalTasks, completedToday, overdueCount, activeProjects] = await Promise.all([
    prisma.task.count({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    }),
    prisma.task.count({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        },
        status: 'DONE',
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.task.count({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        },
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      }
    }),
    prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ],
        status: 'ACTIVE'
      }
    })
  ])

  res.json({
    totalTasks,
    completedToday,
    overdueCount,
    activeProjects
  })
})

export const getMyTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { groupBy } = req.query

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      project: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { dueDate: 'asc' }
  })

  res.json(tasks)
})

export const getActivityFeed = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: { id: true }
  })

  const projectIds = userProjects.map((p) => p.id)

  const activityLogs = await prisma.activityLog.findMany({
    where: {
      projectId: { in: projectIds }
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  res.json(activityLogs)
})

export const getOverdueTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const tasks = await prisma.task.findMany({
    where: {
      project: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      dueDate: { lt: new Date() },
      status: { not: 'DONE' }
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { dueDate: 'asc' }
  })

  res.json(tasks)
})

export const getTasksCompletionStats = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: { id: true, name: true }
  })

  const stats = await Promise.all(
    userProjects.map(async (project) => {
      const total = await prisma.task.count({
        where: { projectId: project.id }
      })

      const done = await prisma.task.count({
        where: { projectId: project.id, status: 'DONE' }
      })

      return {
        projectName: project.name,
        total,
        done,
        percentage: total > 0 ? Math.round((done / total) * 100) : 0
      }
    })
  )

  res.json(stats)
})

export const getTasksByStatusChart = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: { id: true }
  })

  const projectIds = userProjects.map((p) => p.id)

  const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
  const stats = await Promise.all(
    statuses.map(async (status) => {
      const count = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          status
        }
      })
      return { status, count }
    })
  )

  res.json(stats)
})

export const getTasksCompletedDaily = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: { id: true }
  })

  const projectIds = userProjects.map((p) => p.id)

  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))

    const count = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: 'DONE',
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    last7Days.push({
      date: startOfDay.toISOString().split('T')[0],
      completed: count
    })
  }

  res.json(last7Days)
})
