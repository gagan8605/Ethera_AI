import client from './client.js'

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  logout: () => client.post('/auth/logout'),
  getCurrentUser: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/me', data),
  changePassword: (data) => client.put('/auth/me/password', data)
}

export const userAPI = {
  listUsers: () => client.get('/users'),
  getUser: (id) => client.get(`/users/${id}`)
}

export const projectAPI = {
  list: (status) => client.get('/projects', { params: { status } }),
  create: (data) => client.post('/projects', data),
  get: (id) => client.get(`/projects/${id}`),
  update: (id, data) => client.put(`/projects/${id}`, data),
  delete: (id) => client.delete(`/projects/${id}`),
  getMembers: (id) => client.get(`/projects/${id}/members`),
  addMember: (id, data) => client.post(`/projects/${id}/members`, data),
  updateMemberRole: (id, userId, data) => client.put(`/projects/${id}/members/${userId}`, data),
  removeMember: (id, userId) => client.delete(`/projects/${id}/members/${userId}`),
  getActivity: (id) => client.get(`/projects/${id}/activity`)
}

export const taskAPI = {
  list: (projectId, filters) => client.get(`/projects/${projectId}/tasks`, { params: filters }),
  create: (projectId, data) => client.post(`/projects/${projectId}/tasks`, data),
  get: (projectId, id) => client.get(`/projects/${projectId}/tasks/${id}`),
  update: (projectId, id, data) => client.put(`/projects/${projectId}/tasks/${id}`, data),
  delete: (projectId, id) => client.delete(`/projects/${projectId}/tasks/${id}`),
  updateStatus: (projectId, id, status) => client.put(`/projects/${projectId}/tasks/${id}/status`, { status }),
  reorder: (projectId, tasks) => client.post(`/projects/${projectId}/tasks/reorder`, { tasks }),
  getComments: (projectId, id) => client.get(`/projects/${projectId}/tasks/${id}/comments`),
  addComment: (projectId, id, data) => client.post(`/projects/${projectId}/tasks/${id}/comments`, data),
  deleteComment: (projectId, id, commentId) => client.delete(`/projects/${projectId}/tasks/${id}/comments/${commentId}`)
}

export const dashboardAPI = {
  getStats: () => client.get('/dashboard/stats'),
  getMyTasks: (groupBy) => client.get('/dashboard/my-tasks', { params: { groupBy } }),
  getActivity: () => client.get('/dashboard/activity'),
  getOverdueTasks: () => client.get('/dashboard/overdue'),
  getCompletionStats: () => client.get('/dashboard/completion-stats'),
  getStatusChart: () => client.get('/dashboard/status-chart'),
  getTasksCompletedDaily: () => client.get('/dashboard/completed-daily')
}

export const notificationAPI = {
  list: () => client.get('/notifications'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markAsRead: (id) => client.put(`/notifications/${id}/read`),
  markAllAsRead: () => client.put('/notifications/read-all'),
  delete: (id) => client.delete(`/notifications/${id}`)
}

export const teamAPI = {
  overview: () => client.get('/team')
}

export const analyticsAPI = {
  overview: () => client.get('/analytics/overview')
}

export const calendarAPI = {
  events: () => client.get('/calendar/events')
}

export const messageAPI = {
  list: () => client.get('/messages'),
  send: (data) => client.post('/messages', data)
}

export const supportAPI = {
  submit: (data) => client.post('/support', data)
}
