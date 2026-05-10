import prisma from '../utils/db.js'
import { asyncHandler } from '../utils/helpers.js'

const getAccessibleProjectsWhere = (userId) => ({
  OR: [
    { ownerId: userId },
    { members: { some: { userId } } }
  ]
})

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const projects = await prisma.project.findMany({
    where: getAccessibleProjectsWhere(userId),
    include: {
      _count: { select: { tasks: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const projectIds = projects.map((project) => project.id)
  const doneStatus = 'DONE'

  const [totalTasks, completedTasks, overdueTasks, activeProjects] = await Promise.all([
    prisma.task.count({ where: { projectId: { in: projectIds } } }),
    prisma.task.count({ where: { projectId: { in: projectIds }, status: doneStatus } }),
    prisma.task.count({
      where: { projectId: { in: projectIds }, dueDate: { lt: new Date() }, status: { not: doneStatus } }
    }),
    prisma.project.count({ where: { id: { in: projectIds }, status: 'ACTIVE' } })
  ])

  const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

  const [statusChart, priorityChart, completionTrend] = await Promise.all([
    Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await prisma.task.count({ where: { projectId: { in: projectIds }, status } })
      }))
    ),
    Promise.all(
      priorities.map(async (priority) => ({
        priority,
        count: await prisma.task.count({ where: { projectId: { in: projectIds }, priority } })
      }))
    ),
    Promise.all(
      [...Array(7)].map(async (_, index) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - index))
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const completed = await prisma.task.count({
          where: {
            projectId: { in: projectIds },
            status: doneStatus,
            updatedAt: { gte: startOfDay, lte: endOfDay }
          }
        })

        return {
          date: startOfDay.toISOString().split('T')[0],
          completed
        }
      })
    )
  ])

  const projectProgress = await Promise.all(
    projects.map(async (project) => {
      const completed = await prisma.task.count({
        where: { projectId: project.id, status: doneStatus }
      })

      return {
        id: project.id,
        name: project.name,
        color: project.color,
        total: project._count.tasks,
        completed,
        percentage: project._count.tasks > 0 ? Math.round((completed / project._count.tasks) * 100) : 0
      }
    })
  )

  const memberRows = await prisma.projectMember.findMany({
    where: {
      project: getAccessibleProjectsWhere(userId)
    },
    include: {
      user: { select: { id: true, name: true, avatar: true, email: true } },
      project: { select: { id: true, name: true } }
    }
  })

  const memberMap = new Map()

  for (const member of memberRows) {
    if (!memberMap.has(member.userId)) {
      memberMap.set(member.userId, {
        id: member.user.id,
        name: member.user.name,
        avatar: member.user.avatar,
        email: member.user.email,
        projectCount: 0,
        taskCount: 0,
        overdueCount: 0,
        projects: []
      })
    }

    const entry = memberMap.get(member.userId)
    entry.projectCount += 1
    entry.projects.push(member.project.name)
  }

  const memberLoads = [...memberMap.values()]

  await Promise.all(
    memberLoads.map(async (member) => {
      const [taskCount, overdueCount] = await Promise.all([
        prisma.task.count({
          where: {
            assigneeId: member.id,
            project: getAccessibleProjectsWhere(userId)
          }
        }),
        prisma.task.count({
          where: {
            assigneeId: member.id,
            project: getAccessibleProjectsWhere(userId),
            dueDate: { lt: new Date() },
            status: { not: doneStatus }
          }
        })
      ])

      member.taskCount = taskCount
      member.overdueCount = overdueCount
    })
  )

  memberLoads.sort((a, b) => b.taskCount - a.taskCount)

  const overloadedMembers = memberLoads.filter((member) => member.taskCount >= 5 || member.overdueCount >= 2).slice(0, 5)
  const memberLoadSummary = {
    totalMembers: memberLoads.length,
    overloadedMembersCount: overloadedMembers.length,
    averageTasksPerMember: memberLoads.length > 0 ? Math.round((memberLoads.reduce((sum, member) => sum + member.taskCount, 0) / memberLoads.length) * 10) / 10 : 0,
    overloadedMembers
  }

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  res.json({
    stats: {
      totalTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      activeProjects
    },
    statusChart,
    priorityChart,
    completionTrend,
    projectProgress,
    memberLoadSummary
  })
})
