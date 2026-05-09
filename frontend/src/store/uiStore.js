import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  selectedTaskId: null,
  taskDrawerOpen: false,
  showNewProjectModal: false,
  showNewTaskModal: false,
  notificationsOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openTaskDrawer: (taskId) => set({ taskDrawerOpen: true, selectedTaskId: taskId }),
  closeTaskDrawer: () => set({ taskDrawerOpen: false, selectedTaskId: null }),
  openNewProjectModal: () => set({ showNewProjectModal: true }),
  closeNewProjectModal: () => set({ showNewProjectModal: false }),
  openNewTaskModal: () => set({ showNewTaskModal: true }),
  closeNewTaskModal: () => set({ showNewTaskModal: false }),
  toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
  closeNotifications: () => set({ notificationsOpen: false })
}))
