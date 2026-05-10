import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity, createNotificationRecord } from '../utils/helpers.js'
import { emitNotificationEvent } from '../utils/realtime.js'

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '')

const generateProjectKey = async (name) => {
  const base = normalizeText(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 4) || 'PRJ'

  let suffix = Math.floor(100 + Math.random() * 900)
  let key = `${base}-${suffix}`
  let exists = await prisma.project.findFirst({ where: { projectKey: key }, select: { id: true } })

  while (exists) {
    suffix = Math.floor(100 + Math.random() * 900)
    key = `${base}-${suffix}`
    exists = await prisma.project.findFirst({ where: { projectKey: key }, select: { id: true } })
  }

  return key
}

export const listProjects = asyncHandler(async (req, res) => {
  const { status } = req.query

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: req.user.id },
        { members: { some: { userId: req.user.id } } }
      ],
      ...(status && { status })
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      projectManager: { select: { id: true, name: true, avatar: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } }
      },
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json(projects)
})

export const createProject = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    color,
    dueDate,
    team,
    projectManagerId,
    startDate,
    deadline,
    priority,
    budget,
    department,
    clientName,
    visibility
  } = req.body

  const manager = await prisma.user.findUnique({
    where: { id: projectManagerId },
    select: { id: true }
  })

  if (!manager) {
    throw new ApiError(404, 'Project manager not found')
  }

  const projectKey = await generateProjectKey(name)

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      color: color || '#6366f1',
      projectKey,
      teamName: team,
      projectManagerId,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: (deadline || dueDate) ? new Date(deadline || dueDate) : null,
      priority: priority || 'MEDIUM',
      budget: budget !== undefined && budget !== '' ? Number(budget) : null,
      department: department || null,
      clientName: clientName || null,
      visibility: visibility || 'TEAM',
      ownerId: req.user.id
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      projectManager: { select: { id: true, name: true, avatar: true, email: true } },
      members: true,
      _count: { select: { tasks: true } }
    }
  })

  if (projectManagerId !== req.user.id) {
    await prisma.projectMember.upsert({
      where: {
        userId_projectId: {
          userId: projectManagerId,
          projectId: project.id
        }
      },
      create: {
        userId: projectManagerId,
        projectId: project.id,
        role: 'ADMIN'
      },
      update: {
        role: 'ADMIN'
      }
    })
  }

  await logActivity(prisma, req.user.id, 'CREATE', 'PROJECT', project.id, project.id, null, {
    projectKey,
    team,
    projectManagerId,
    priority: project.priority
  })

  res.status(201).json(project)
})

export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatar: true, email: true } },
      projectManager: { select: { id: true, name: true, avatar: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true, email: true } } }
      },
      _count: { select: { tasks: true } }
    }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const isMember =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  res.json(project)
})

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    name,
    description,
    color,
    status,
    dueDate,
    team,
    projectManagerId,
    startDate,
    deadline,
    priority,
    budget,
    department,
    clientName,
    visibility
  } = req.body

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const isAdmin =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id && m.role === 'ADMIN')

  if (!isAdmin && project.ownerId !== req.user.id) {
    throw new ApiError(403, 'Only project admin can update')
  }

  if (projectManagerId) {
    const manager = await prisma.user.findUnique({
      where: { id: projectManagerId },
      select: { id: true }
    })

    if (!manager) {
      throw new ApiError(404, 'Project manager not found')
    }
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(deadline && { dueDate: new Date(deadline) }),
      ...(team !== undefined && { teamName: team || null }),
      ...(projectManagerId !== undefined && { projectManagerId: projectManagerId || null }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(priority && { priority }),
      ...(budget !== undefined && { budget: budget === '' ? null : Number(budget) }),
      ...(department !== undefined && { department: department || null }),
      ...(clientName !== undefined && { clientName: clientName || null }),
      ...(visibility && { visibility })
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      projectManager: { select: { id: true, name: true, avatar: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } }
      },
      _count: { select: { tasks: true } }
    }
  })

  await logActivity(prisma, req.user.id, 'UPDATE', 'PROJECT', id, id)

  res.json(updated)
})

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  if (project.ownerId !== req.user.id) {
    throw new ApiError(403, 'Only project owner can delete')
  }

  await prisma.project.delete({
    where: { id }
  })

  await logActivity(prisma, req.user.id, 'DELETE', 'PROJECT', id, id)

  res.json({ message: 'Project deleted successfully' })
})

export const getProjectMembers = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } }
        }
      },
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { tasks: true } }
    }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const isMember =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  const membersWithTaskCount = await Promise.all(
    project.members.map(async (member) => {
      const taskCount = await prisma.task.count({
        where: {
          projectId: id,
          assigneeId: member.userId
        }
      })
      return {
        ...member,
        taskCount
      }
    })
  )

  res.json({ members: membersWithTaskCount, owner: project.owner })
})

export const addProjectMember = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { email, role } = req.body

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const isAdmin =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id && m.role === 'ADMIN')

  if (!isAdmin && project.ownerId !== req.user.id) {
    throw new ApiError(403, 'Only project admin can add members')
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: id
      }
    }
  })

  if (existingMember) {
    throw new ApiError(400, 'User is already a project member')
  }

  const member = await prisma.projectMember.create({
    data: {
      userId: user.id,
      projectId: id,
      role: role || 'MEMBER'
    },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
  })

  await logActivity(prisma, req.user.id, 'ADD_MEMBER', 'PROJECT', id, id, null, { email })

  // Create notification
  const notification = await createNotificationRecord(prisma, {
    userId: user.id,
    type: 'MEMBER_ADDED',
    message: `You were added to project ${project.name}`,
    link: `/projects/${id}`
  })

  emitNotificationEvent(user.id, { type: 'MEMBER_ADDED', notification })

  res.status(201).json(member)
})

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { id, userId } = req.params
  const { role } = req.body

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const isAdmin =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id && m.role === 'ADMIN')

  if (!isAdmin && project.ownerId !== req.user.id) {
    throw new ApiError(403, 'Only project admin can change roles')
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: id
      }
    }
  })

  if (!member) {
    throw new ApiError(404, 'Member not found')
  }

  const updated = await prisma.projectMember.update({
    where: { id: member.id },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
  })

  await logActivity(prisma, req.user.id, 'UPDATE_MEMBER_ROLE', 'PROJECT', id, id, null, { userId, role })

  res.json(updated)
})

export const removeProjectMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  if (project.ownerId === userId) {
    throw new ApiError(400, 'Cannot remove project owner')
  }

  const isAdmin =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id && m.role === 'ADMIN')

  if (!isAdmin && project.ownerId !== req.user.id) {
    throw new ApiError(403, 'Only project admin can remove members')
  }

  await prisma.projectMember.deleteMany({
    where: {
      userId,
      projectId: id
    }
  })

  await logActivity(prisma, req.user.id, 'REMOVE_MEMBER', 'PROJECT', id, id, null, { userId })

  res.json({ message: 'Member removed successfully' })
})

export const getProjectActivity = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true }
  })

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const isMember =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  const activityLogs = await prisma.activityLog.findMany({
    where: { projectId: id },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  res.json(activityLogs)
})
