import { verifyAccessToken, generateTokens, verifyRefreshToken } from '../utils/jwt.js'
import { ApiError } from '../utils/helpers.js'
import prisma from '../utils/db.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new ApiError(401, 'No token provided')
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      throw new ApiError(401, 'Invalid token')
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw new ApiError(401, 'User not found')
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    res.status(500).json({ message: 'Authentication failed' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId
        }
      }
    })

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!member && project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not a project member' })
    }

    req.projectMember = member
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error checking membership' })
  }
}

export const requireProjectAdmin = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.ownerId !== req.user.id) {
      const member = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId
          }
        }
      })

      if (!member || member.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Project admin access required' })
      }
    }

    req.project = project
    next()
  } catch (error) {
    res.status(500).json({ message: 'Error checking project admin' })
  }
}
