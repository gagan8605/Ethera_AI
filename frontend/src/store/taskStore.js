import { create } from 'zustand'

export const useTaskStore = create((set) => ({
  tasks: [],
  isLoading: false,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id)
    })),
  reorderTasks: (tasks) => set({ tasks })
}))
