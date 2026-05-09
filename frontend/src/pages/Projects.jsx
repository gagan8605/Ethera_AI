import React from 'react'
import { useProjects, useCreateProject } from '../hooks/useApi'
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy, 
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Projects() {
  const navigate = useNavigate()
  const { data: projects, isLoading, refetch } = useProjects()
  const createProject = useCreateProject()
  const [showModal, setShowModal] = useState(false)
  const [showMenuFor, setShowMenuFor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    category: 'work'
  })

  const colors = [
    { value: '#6366f1', name: 'Indigo', gradient: 'from-indigo-500 to-indigo-600' },
    { value: '#ec4899', name: 'Pink', gradient: 'from-pink-500 to-pink-600' },
    { value: '#f59e0b', name: 'Amber', gradient: 'from-amber-500 to-amber-600' },
    { value: '#10b981', name: 'Emerald', gradient: 'from-emerald-500 to-emerald-600' },
    { value: '#06b6d4', name: 'Cyan', gradient: 'from-cyan-500 to-cyan-600' },
    { value: '#8b5cf6', name: 'Purple', gradient: 'from-purple-500 to-purple-600' },
    { value: '#ef4444', name: 'Red', gradient: 'from-red-500 to-red-600' },
    { value: '#3b82f6', name: 'Blue', gradient: 'from-blue-500 to-blue-600' }
  ]

  const categories = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '🏠' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'health', label: 'Health', icon: '💪' }
  ]

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }
    if (formData.name.length < 3) {
      toast.error('Project name must be at least 3 characters')
      return
    }
    try {
      await createProject.mutateAsync(formData)
      toast.success('Project created successfully!')
      setShowModal(false)
      setFormData({ name: '', description: '', color: '#6366f1', category: 'work' })
      refetch()
    } catch (error) {
      toast.error(error.message || 'Failed to create project')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle }
      case 'completed':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: CheckCircle }
      case 'on-hold':
        return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock }
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', icon: AlertCircle }
    }
  }

  const getTaskProgress = (project) => {
    const total = project._count?.tasks || 0
    const completed = project._count?.completedTasks || 0
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Projects
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Manage and organize your team projects
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              New Project
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Stats Overview */}
        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projects.filter(p => p.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projects.reduce((sum, p) => sum + (p._count?.tasks || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projects.reduce((sum, p) => sum + (p._count?.members || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : projects && projects.length > 0 ? (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
              <button className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400">
                All Projects
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                Active
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                Completed
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                Archived
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const StatusIcon = getStatusColor(project.status).icon
                const progress = getTaskProgress(project)
                
                return (
                  <div
                    key={project.id}
                    className="group relative bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden"
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    
                    <div className="relative p-6 bg-white dark:bg-gray-800/90 rounded-2xl transition-all duration-300 group-hover:bg-white/95 dark:group-hover:bg-gray-800/95">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg"
                            style={{ backgroundColor: project.color }}
                          ></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {project.category || 'Work'}
                              </span>
                              <span className={clsx(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium",
                                getStatusColor(project.status).bg,
                                getStatusColor(project.status).text
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {project.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMenuFor(showMenuFor === project.id ? null : project.id)
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                          
                          {showMenuFor === project.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 animate-fade-in">
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Edit2 className="w-4 h-4" />
                                Edit Project
                              </button>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </button>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                              <hr className="my-1 border-gray-200 dark:border-gray-700" />
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Info */}
                      <div onClick={() => navigate(`/projects/${project.id}`)}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {project.description || 'No description provided'}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)`
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {project.members?.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br shadow-sm"
                                  style={{ 
                                    backgroundImage: `linear-gradient(135deg, ${project.color}, ${project.color}dd)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title={member.user?.name}
                                >
                                  <span className="text-white text-xs font-medium">
                                    {member.user?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              ))}
                              {project.members?.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    +{project.members.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {project.members?.length || 0} members
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {project._count.tasks} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first project</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Project</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-4 space-y-3">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile App Development"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this project is about..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="2"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: category.value })}
                        className={clsx(
                          "px-2 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-2 text-xs",
                          formData.category === category.value
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300"
                        )}
                      >
                        <span className="text-sm">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Brand Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className="relative group"
                      >
                        <div
                          className={clsx(
                            "w-full aspect-square rounded-lg transition-all duration-200 transform hover:scale-110",
                            `bg-gradient-to-br ${color.gradient}`,
                            formData.color === color.value && "ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-800"
                          )}
                        />
                        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProject.isPending}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createProject.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}