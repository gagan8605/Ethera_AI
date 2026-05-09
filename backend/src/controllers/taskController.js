import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity } from '../utils/helpers.js'

export const listTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const { status, priority, assigneeId, search, overdue } = req.query

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  const whereClause = {
    projectId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeId && { assigneeId }),
    ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] }),
    ...(overdue === 'true' && { dueDate: { lt: new Date() }, status: { not: 'DONE' } })
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { position: 'asc' }
  })

  res.json(tasks)
})

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const { title, description, priority, dueDate, tags, assigneeId } = req.body

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  const maxPosition = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
    select: { position: true }
  })

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      position: (maxPosition?.position || 0) + 1,
      projectId,
      creatorId: req.user.id,
      assigneeId: assigneeId || null
    },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } }
    }
  })

  await logActivity(prisma, req.user.id, 'CREATE', 'TASK', task.id, projectId, task.id, { title })

  // Create notification for assignee
  if (assigneeId && assigneeId !== req.user.id) {
    await prisma.notification.create({
      data: {
        userId: assigneeId,
        type: 'TASK_ASSIGNED',
        message: `You were assigned to task: ${title}`,
        link: `/projects/${projectId}`
      }
    })
  }

  res.status(201).json(task)
})

export const getTask = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, avatar: true, email: true } },
      creator: { select: { id: true, name: true, avatar: true, email: true } },
      project: { select: { id: true, name: true } },
      comments: {
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true }
  })

  const isMember =
    project.ownerId === req.user.id ||
    project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  res.json(task)
})

export const updateTask = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params
  const { title, description, status, priority, assigneeId, dueDate, tags } = req.body

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const isAdmin =
    task.project.ownerId === req.user.id ||
    task.project.members.some((m) => m.userId === req.user.id && m.role === 'ADMIN') ||
    task.creatorId === req.user.id

  if (!isAdmin) {
    throw new ApiError(403, 'Only task creator or project admin can update')
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(tags && { tags })
    },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } }
    }
  })

  await logActivity(prisma, req.user.id, 'UPDATE', 'TASK', id, projectId, id)

  res.json(updated)
})

export const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const isAdmin =
    task.project.ownerId === req.user.id ||
    task.project.members.some((m) => m.userId === req.user.id && m.role === 'ADMIN') ||
    task.creatorId === req.user.id

  if (!isAdmin) {
    throw new ApiError(403, 'Only task creator or project admin can delete')
  }

  await prisma.task.delete({
    where: { id }
  })

  await logActivity(prisma, req.user.id, 'DELETE', 'TASK', id, projectId, id)

  res.json({ message: 'Task deleted successfully' })
})

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params
  const { status } = req.body

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const isMember =
    task.project.ownerId === req.user.id ||
    task.project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { status },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } }
    }
  })

  await logActivity(prisma, req.user.id, 'UPDATE_STATUS', 'TASK', id, projectId, id, { status })

  res.json(updated)
})

export const reorderTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const { tasks } = req.body

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  const updatePromises = tasks.map((task) =>
    prisma.task.update({
      where: { id: task.id },
      data: { position: task.position, status: task.status }
    })
  )

  await Promise.all(updatePromises)

  const updated = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { position: 'asc' }
  })

  res.json(updated)
})

export const createComment = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params
  const { content } = req.body

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const isMember =
    task.project.ownerId === req.user.id ||
    task.project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId: id,
      authorId: req.user.id
    },
    include: { author: { select: { id: true, name: true, avatar: true } } }
  })

  await logActivity(prisma, req.user.id, 'CREATE_COMMENT', 'TASK', id, projectId, id)

  // Notify other commenters
  if (task.assigneeId && task.assigneeId !== req.user.id) {
    await prisma.notification.create({
      data: {
        userId: task.assigneeId,
        type: 'COMMENT_ADDED',
        message: `New comment on task: ${task.title}`,
        link: `/projects/${projectId}`
      }
    })
  }

  res.status(201).json(comment)
})

export const getTaskComments = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const isMember =
    task.project.ownerId === req.user.id ||
    task.project.members.some((m) => m.userId === req.user.id)

  if (!isMember) {
    throw new ApiError(403, 'Access denied')
  }

  const comments = await prisma.comment.findMany({
    where: { taskId: id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' }
  })

  res.json(comments)
})

export const deleteComment = asyncHandler(async (req, res) => {
  const { projectId, id, commentId } = req.params

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { include: { members: true } } }
  })

  if (!task || task.projectId !== projectId) {
    throw new ApiError(404, 'Task not found')
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  })

  if (!comment || comment.taskId !== id) {
    throw new ApiError(404, 'Comment not found')
  }

  if (comment.authorId !== req.user.id && task.project.ownerId !== req.user.id) {
    throw new ApiError(403, 'Can only delete own comments')
  }

  await prisma.comment.delete({
    where: { id: commentId }
  })

  await logActivity(prisma, req.user.id, 'DELETE_COMMENT', 'TASK', id, projectId, id)

  res.json({ message: 'Comment deleted successfully' })
})
