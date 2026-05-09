import prisma from '../utils/db.js'
import { asyncHandler } from '../utils/helpers.js'

const getAccessibleProjectsWhere = (userId) => ({
  OR: [
    { ownerId: userId },
    { members: { some: { userId } } }
  ]
})

export const getTeamOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const projects = await prisma.project.findMany({
    where: getAccessibleProjectsWhere(userId),
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, role: true } }
        }
      },
      _count: { select: { tasks: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const projectIds = projects.map((project) => project.id)
  const memberMap = new Map()

  const ensureMember = (user, roleLabel) => {
    if (!user) return null

    if (!memberMap.has(user.id)) {
      memberMap.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        projectCount: 0,
        taskCount: 0,
        projects: [],
        roles: new Set([roleLabel])
      })
    } else {
      memberMap.get(user.id).roles.add(roleLabel)
    }

    return memberMap.get(user.id)
  }

  projects.forEach((project) => {
    const ownerRecord = ensureMember(project.owner, 'OWNER')
    if (ownerRecord) {
      ownerRecord.projectCount += 1
      ownerRecord.projects.push({
        id: project.id,
        name: project.name,
        color: project.color,
        status: project.status,
        role: 'OWNER'
      })
    }

    project.members.forEach((member) => {
      const memberRecord = ensureMember(member.user, member.role)
      if (memberRecord) {
        memberRecord.projectCount += 1
        memberRecord.projects.push({
          id: project.id,
          name: project.name,
          color: project.color,
          status: project.status,
          role: member.role
        })
      }
    })
  })

  if (projectIds.length > 0 && memberMap.size > 0) {
    const taskCounts = await Promise.all(
      [...memberMap.keys()].map(async (memberId) => {
        const count = await prisma.task.count({
          where: {
            projectId: { in: projectIds },
            OR: [{ assigneeId: memberId }, { creatorId: memberId }]
          }
        })
        return [memberId, count]
      })
    )

    taskCounts.forEach(([memberId, count]) => {
      const member = memberMap.get(memberId)
      if (member) {
        member.taskCount = count
      }
    })
  }

  const members = [...memberMap.values()]
    .map(({ roles, ...member }) => ({
      ...member,
      roles: [...roles]
    }))
    .sort((a, b) => b.projectCount - a.projectCount || b.taskCount - a.taskCount)

  res.json({
    summary: {
      totalMembers: members.length,
      activeProjects: projects.filter((project) => project.status === 'ACTIVE').length,
      totalProjects: projects.length,
      totalTasks: projects.reduce((sum, project) => sum + project._count.tasks, 0)
    },
    members,
    projects: projects.slice(0, 6).map((project) => ({
      id: project.id,
      name: project.name,
      color: project.color,
      status: project.status,
      owner: project.owner,
      memberCount: project.members.length,
      taskCount: project._count.tasks
    }))
  })
})
