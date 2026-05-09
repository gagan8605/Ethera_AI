import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.notification.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.activityLog.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.projectMember.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.user.deleteMany({})

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: await bcryptjs.hash('Admin123!', 10),
      avatar: '#6366f1',
      role: 'ADMIN'
    }
  })

  const alice = await prisma.user.create({
    data: {
      name: 'Sagar Sharma',
      email: 'sagar@demo.com',
      password: await bcryptjs.hash('Member123!', 10),
      avatar: '#ec4899',
      role: 'MEMBER'
    }
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Ram Kumar',
      email: 'ram@demo.com',
      password: await bcryptjs.hash('Member123!', 10),
      avatar: '#f59e0b',
      role: 'MEMBER'
    }
  })

  const carol = await prisma.user.create({
    data: {
      name: 'Priya Verma',
      email: 'priya@demo.com',
      password: await bcryptjs.hash('Member123!', 10),
      avatar: '#10b981',
      role: 'MEMBER'
    }
  })

  console.log('✅ Users created')

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Complete redesign of the mobile application UI/UX',
      color: '#6366f1',
      status: 'ACTIVE',
      dueDate: new Date('2024-12-31'),
      ownerId: alice.id
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Backend API Development',
      description: 'Build RESTful APIs for the new platform',
      color: '#ec4899',
      status: 'ACTIVE',
      dueDate: new Date('2024-11-30'),
      ownerId: bob.id
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Documentation Update',
      description: 'Update project documentation and create user guides',
      color: '#f59e0b',
      status: 'ACTIVE',
      dueDate: new Date('2024-10-15'),
      ownerId: carol.id
    }
  })

  console.log('✅ Projects created')

  // Add project members
  await prisma.projectMember.create({
    data: { userId: bob.id, projectId: project1.id, role: 'MEMBER' }
  })
  await prisma.projectMember.create({
    data: { userId: carol.id, projectId: project1.id, role: 'MEMBER' }
  })

  await prisma.projectMember.create({
    data: { userId: alice.id, projectId: project2.id, role: 'ADMIN' }
  })
  await prisma.projectMember.create({
    data: { userId: carol.id, projectId: project2.id, role: 'MEMBER' }
  })

  await prisma.projectMember.create({
    data: { userId: alice.id, projectId: project3.id, role: 'MEMBER' }
  })
  await prisma.projectMember.create({
    data: { userId: bob.id, projectId: project3.id, role: 'ADMIN' }
  })

  console.log('✅ Project members added')

  // Create tasks for project1
  const tasks1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design new landing page',
        description: 'Create mockups for the new landing page design',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-10-20'),
        tags: ['design', 'ui'],
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: bob.id,
        position: 1
      }
    }),
    prisma.task.create({
      data: {
        title: 'Implement responsive navigation',
        description: 'Make navigation menu responsive for all screen sizes',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-10-25'),
        tags: ['frontend', 'responsive'],
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: carol.id,
        position: 2
      }
    }),
    prisma.task.create({
      data: {
        title: 'Test on mobile devices',
        description: 'Test the redesign on various mobile devices',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-11-05'),
        tags: ['testing', 'mobile'],
        projectId: project1.id,
        creatorId: alice.id,
        position: 3
      }
    }),
    prisma.task.create({
      data: {
        title: 'Update color palette',
        description: 'Implement new brand colors throughout the app',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2024-10-10'),
        tags: ['design', 'branding'],
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: bob.id,
        position: 4
      }
    }),
    prisma.task.create({
      data: {
        title: 'Create design system',
        description: 'Document all UI components and design patterns',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        dueDate: new Date('2024-10-30'),
        tags: ['design', 'documentation'],
        projectId: project1.id,
        creatorId: alice.id,
        assigneeId: carol.id,
        position: 5
      }
    })
  ])

  // Create tasks for project2
  const tasks2 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Build user authentication API',
        description: 'Implement JWT-based authentication with refresh tokens',
        status: 'DONE',
        priority: 'URGENT',
        dueDate: new Date('2024-09-30'),
        tags: ['backend', 'auth'],
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: alice.id,
        position: 1
      }
    }),
    prisma.task.create({
      data: {
        title: 'Create project management endpoints',
        description: 'Build APIs for project CRUD operations',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-10-15'),
        tags: ['backend', 'api'],
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: bob.id,
        position: 2
      }
    }),
    prisma.task.create({
      data: {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-10-25'),
        tags: ['documentation', 'api'],
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: carol.id,
        position: 3
      }
    }),
    prisma.task.create({
      data: {
        title: 'Setup database schema',
        description: 'Design and implement PostgreSQL schema',
        status: 'DONE',
        priority: 'URGENT',
        dueDate: new Date('2024-09-20'),
        tags: ['backend', 'database'],
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: alice.id,
        position: 4
      }
    }),
    prisma.task.create({
      data: {
        title: 'Implement error handling',
        description: 'Add comprehensive error handling and validation',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-10-20'),
        tags: ['backend'],
        projectId: project2.id,
        creatorId: bob.id,
        assigneeId: bob.id,
        position: 5
      }
    })
  ])

  // Create tasks for project3
  const tasks3 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Write API documentation',
        description: 'Create comprehensive API documentation',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2024-10-10'),
        tags: ['documentation'],
        projectId: project3.id,
        creatorId: carol.id,
        assigneeId: alice.id,
        position: 1
      }
    }),
    prisma.task.create({
      data: {
        title: 'Update user guides',
        description: 'Update existing user guides with new features',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-10-15'),
        tags: ['documentation'],
        projectId: project3.id,
        creatorId: carol.id,
        assigneeId: bob.id,
        position: 2
      }
    }),
    prisma.task.create({
      data: {
        title: 'Create video tutorials',
        description: 'Record video tutorials for common tasks',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date('2024-10-30'),
        tags: ['documentation', 'video'],
        projectId: project3.id,
        creatorId: carol.id,
        position: 3
      }
    }),
    prisma.task.create({
      data: {
        title: 'Review and approve documentation',
        description: 'Review all documentation for accuracy and completeness',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2024-10-20'),
        tags: ['documentation', 'review'],
        projectId: project3.id,
        creatorId: carol.id,
        assigneeId: bob.id,
        position: 4
      }
    })
  ])

  console.log('✅ Tasks created')

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Great progress! The design looks amazing so far.',
      taskId: tasks1[0].id,
      authorId: carol.id
    }
  })

  await prisma.comment.create({
    data: {
      content: 'Please check the mobile view on iPhone 12',
      taskId: tasks1[0].id,
      authorId: alice.id
    }
  })

  await prisma.comment.create({
    data: {
      content: 'Authentication is working perfectly in testing',
      taskId: tasks2[0].id,
      authorId: bob.id
    }
  })

  console.log('✅ Comments created')

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      userId: alice.id,
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: project1.id,
      projectId: project1.id,
      metadata: { name: 'Mobile App Redesign' }
    }
  })

  await prisma.activityLog.create({
    data: {
      userId: bob.id,
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: project2.id,
      projectId: project2.id,
      metadata: { name: 'Backend API Development' }
    }
  })

  await prisma.activityLog.create({
    data: {
      userId: alice.id,
      action: 'CREATE',
      entity: 'TASK',
      entityId: tasks1[0].id,
      projectId: project1.id,
      taskId: tasks1[0].id,
      metadata: { title: 'Design new landing page' }
    }
  })

  console.log('✅ Activity logs created')

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: bob.id,
      type: 'TASK_ASSIGNED',
      message: 'You were assigned to task: Design new landing page',
      link: `/projects/${project1.id}`
    }
  })

  await prisma.notification.create({
    data: {
      userId: carol.id,
      type: 'MEMBER_ADDED',
      message: `You were added to project ${project1.name}`,
      link: `/projects/${project1.id}`
    }
  })

  console.log('✅ Notifications created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
