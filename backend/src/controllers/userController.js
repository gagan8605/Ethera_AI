import prisma from '../utils/db.js'
import { ApiError, asyncHandler, logActivity } from '../utils/helpers.js'

export const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: {
        select: { ownedProjects: true, assignedTasks: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.json(users)
})

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: {
        select: { ownedProjects: true, assignedTasks: true }
      }
    }
  })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res.json(user)
})
