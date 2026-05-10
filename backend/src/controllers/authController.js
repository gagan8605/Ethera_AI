import bcryptjs from 'bcryptjs'
import prisma from '../utils/db.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js'
import { ApiError, asyncHandler } from '../utils/helpers.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new ApiError(400, 'Email already registered')
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatar: generateAvatarColor()
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  const { accessToken, refreshToken } = generateTokens(user.id)

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  res.status(201).json({
    user,
    tokens: { accessToken, refreshToken }
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const { accessToken, refreshToken } = generateTokens(user.id)

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  })

  const userWithoutPassword = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  }

  res.json({
    user: userWithoutPassword,
    tokens: { accessToken, refreshToken }
  })
})

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token required')
  }

  const decoded = verifyRefreshToken(refreshToken)

  if (!decoded) {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  if (!user) {
    throw new ApiError(401, 'User not found')
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user.id)

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({
    tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken }
  })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  })

  res.json(user)
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(avatar && { avatar })
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  })

  res.json(user)
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  })

  const isPasswordValid = await bcryptjs.compare(currentPassword, user.password)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword }
  })

  res.json({ message: 'Password changed successfully' })
})

export const deactivateAccount = asyncHandler(async (req, res) => {
  const { password } = req.body

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  })

  const isPasswordValid = await bcryptjs.compare(password, user.password)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Password is incorrect')
  }

  if (!user.isActive) {
    throw new ApiError(400, 'Account is already deactivated')
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { isActive: false }
  })

  res.json({ message: 'Account deactivated successfully' })
})

export const activateAccount = asyncHandler(async (req, res) => {
  const { password } = req.body

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  })

  const isPasswordValid = await bcryptjs.compare(password, user.password)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Password is incorrect')
  }

  if (user.isActive) {
    throw new ApiError(400, 'Account is already active')
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { isActive: true }
  })

  res.json({ message: 'Account activated successfully' })
})

export const deleteAccount = asyncHandler(async (req, res) => {
  const { password, confirmDelete } = req.body

  if (confirmDelete !== 'DELETE') {
    throw new ApiError(400, 'Please type "DELETE" to confirm account deletion')
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  })

  const isPasswordValid = await bcryptjs.compare(password, user.password)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Password is incorrect')
  }

  // Delete all related data first due to foreign key constraints
  await prisma.comment.deleteMany({
    where: { userId: req.user.id }
  })

  await prisma.notification.deleteMany({
    where: { userId: req.user.id }
  })

  await prisma.activityLog.deleteMany({
    where: { userId: req.user.id }
  })

  await prisma.supportTicketComment.deleteMany({
    where: { userId: req.user.id }
  })

  await prisma.supportTicket.deleteMany({
    where: {
      OR: [
        { requesterId: req.user.id },
        { assigneeId: req.user.id }
      ]
    }
  })

  await prisma.task.deleteMany({
    where: {
      OR: [
        { assigneeId: req.user.id },
        { creatorId: req.user.id }
      ]
    }
  })

  await prisma.projectMember.deleteMany({
    where: { userId: req.user.id }
  })

  await prisma.project.deleteMany({
    where: { ownerId: req.user.id }
  })

  await prisma.meeting.deleteMany({
    where: { creatorId: req.user.id }
  })

  // Finally delete the user
  await prisma.user.delete({
    where: { id: req.user.id }
  })

  res.clearCookie('refreshToken')
  res.json({ message: 'Account deleted successfully' })
})

const generateAvatarColor = () => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6']
  return colors[Math.floor(Math.random() * colors.length)]
}
