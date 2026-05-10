import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectAPI, taskAPI, dashboardAPI, notificationAPI, teamAPI, analyticsAPI, calendarAPI, messageAPI, supportAPI } from '../api/index.js'
import toast from 'react-hot-toast'

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectAPI.list()
      return response.data
    }
  })
}

export const useProject = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await projectAPI.get(projectId)
      return response.data
    },
    enabled: !!projectId
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectAPI.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => projectAPI.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast.success('Project updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update project')
    }
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => projectAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    }
  })
}

export const useTasks = (projectId, filters = {}) => {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: async () => {
      const response = await taskAPI.list(projectId, filters)
      return response.data
    },
    enabled: !!projectId
  })
}

export const useTask = (projectId, taskId) => {
  return useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: async () => {
      const response = await taskAPI.get(projectId, taskId)
      return response.data
    },
    enabled: !!projectId && !!taskId
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }) => taskAPI.create(projectId, data),
    onSuccess: (response, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, data }) => taskAPI.update(projectId, taskId, data),
    onSuccess: (response, { projectId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] })
      toast.success('Task updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task')
    }
  })
}

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, status }) => taskAPI.updateStatus(projectId, taskId, status),
    onSuccess: (response, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-my-tasks'] })
      if (projectId) queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task status')
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId }) => taskAPI.delete(projectId, taskId),
    onSuccess: (response, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    }
  })
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useDashboardMyTasks = () => {
  return useQuery({
    queryKey: ['dashboard-my-tasks'],
    queryFn: async () => {
      const response = await dashboardAPI.getMyTasks()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useActivityFeed = () => {
  return useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const response = await dashboardAPI.getActivity()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationAPI.list()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useTeamOverview = () => {
  return useQuery({
    queryKey: ['team-overview'],
    queryFn: async () => {
      const response = await teamAPI.overview()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await analyticsAPI.overview()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useCalendarEvents = () => {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await calendarAPI.events()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useCreateMeeting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => calendarAPI.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Meeting created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create meeting')
    }
  })
}

export const useMessages = () => {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await messageAPI.list()
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => messageAPI.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      toast.success('Message sent successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message')
    }
  })
}

export const useSubmitSupportRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => supportAPI.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      toast.success('Support request submitted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit support request')
    }
  })
}

export const useSupportTickets = (params = {}) => {
  return useQuery({
    queryKey: ['support-tickets', params],
    queryFn: async () => {
      const response = await supportAPI.listTickets(params)
      return response.data
    },
    refetchInterval: 30000
  })
}

export const useSupportTicket = (ticketId) => {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      const response = await supportAPI.getTicket(ticketId)
      return response.data.ticket
    },
    enabled: !!ticketId,
    refetchInterval: 15000
  })
}

export const useSupportTicketComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, content }) => supportAPI.addComment(ticketId, { content }),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] })
      toast.success('Comment added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    }
  })
}

export const useUpdateSupportTicketStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, status }) => supportAPI.updateStatus(ticketId, { status }),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] })
      toast.success('Support ticket status updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update ticket status')
    }
  })
}

export const useAssignSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, assignedToId }) => supportAPI.assignTicket(ticketId, { assignedToId }),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] })
      toast.success('Support ticket assigned successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign ticket')
    }
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useNotificationStream = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token || typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return undefined
    }

    const source = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/realtime/notifications?token=${encodeURIComponent(token)}`)

    const handleNotification = (event) => {
      try {
        const payload = JSON.parse(event.data)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-my-tasks'] })
        queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
        queryClient.invalidateQueries({ queryKey: ['support-ticket'] })
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] })
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
        queryClient.invalidateQueries({ queryKey: ['analytics-overview'] })

        if (payload?.type?.startsWith('TASK_')) {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      } catch {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }
    }

    source.addEventListener('notification', handleNotification)
    source.onerror = () => {
      source.close()
    }

    return () => {
      source.removeEventListener('notification', handleNotification)
      source.close()
    }
  }, [queryClient])
}

export const useMarkAllNotifications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
