import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity } from '../utils/helpers.js'

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
  const { name, description, color, dueDate } = req.body

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      color: color || '#6366f1',
      dueDate: dueDate ? new Date(dueDate) : null,
      ownerId: req.user.id
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: true,
      _count: { select: { tasks: true } }
    }
  })

  await logActivity(prisma, req.user.id, 'CREATE', 'PROJECT', project.id, project.id)

  res.status(201).json(project)
})

export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatar: true, email: true } },
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
  const { name, description, color, status, dueDate } = req.body

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

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) })
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
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
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'MEMBER_ADDED',
      message: `You were added to project ${project.name}`,
      link: `/projects/${id}`
    }
  })

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
