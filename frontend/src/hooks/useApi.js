import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectAPI, taskAPI, dashboardAPI, notificationAPI } from '../api/index.js'
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

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
