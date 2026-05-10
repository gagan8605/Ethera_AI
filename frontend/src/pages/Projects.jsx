import React, { useMemo, useState, useEffect } from 'react'
import { Plus, FolderOpen, Users, Calendar, MoreVertical, Edit2, Trash2, Archive, CheckCircle, X } from 'lucide-react'
import Layout from '../components/Layout'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { userAPI } from '../api/index.js'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useCreateTask, useTasks } from '../hooks/useApi'

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const VISIBILITY_OPTIONS = ['PRIVATE', 'TEAM', 'PUBLIC']

const emptyForm = {
  name: '',
  description: '',
  team: '',
  projectManagerId: '',
  startDate: '',
  deadline: '',
  priority: 'MEDIUM',
  budget: '',
  department: '',
  clientName: '',
  visibility: 'TEAM'
}

const emptyTaskForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeId: '',
  tags: '',
  attachments: ''
}

const canCreateTasks = (project) => project?.status === 'ACTIVE' || project?.status === 'ARCHIVED'

const normalizeProjectPayload = (data) => {
  const payload = {
    name: data.name?.trim(),
    description: data.description?.trim(),
    team: data.team?.trim(),
    projectManagerId: data.projectManagerId,
    startDate: data.startDate,
    deadline: data.deadline,
    priority: data.priority,
    visibility: data.visibility
  }

  if (data.budget !== '' && data.budget !== null && data.budget !== undefined) {
    payload.budget = Number(data.budget)
  }

  if (data.department?.trim()) {
    payload.department = data.department.trim()
  }

  if (data.clientName?.trim()) {
    payload.clientName = data.clientName.trim()
  }

  return payload
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export default function Projects() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const { data: projects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const createTask = useCreateTask()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [activeTab, setActiveTab] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [menuOpenFor, setMenuOpenFor] = useState(null)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [projectForTask, setProjectForTask] = useState(null)
  const [projectForTasks, setProjectForTasks] = useState(null)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [taskFormData, setTaskFormData] = useState(emptyTaskForm)

  useEffect(() => {
    if (!isAdmin) return
    userAPI
      .listUsers()
      .then((response) => setUsers(response.data || []))
      .catch(() => setUsers([]))
  }, [isAdmin])

  const managerOptions = useMemo(() => {
    return users.filter((member) => member.role === 'ADMIN' || member.role === 'MEMBER')
  }, [users])

  const filteredProjects = useMemo(() => {
    if (activeTab === 'ALL') return projects
    return projects.filter((project) => project.status === activeTab)
  }, [activeTab, projects])

  const counts = useMemo(() => {
    return {
      ALL: projects.length,
      ACTIVE: projects.filter((project) => project.status === 'ACTIVE').length,
      COMPLETED: projects.filter((project) => project.status === 'COMPLETED').length,
      ARCHIVED: projects.filter((project) => project.status === 'ARCHIVED').length
    }
  }, [projects])

  const onCreate = async (event) => {
    event.preventDefault()
    try {
      await createProject.mutateAsync(normalizeProjectPayload(formData))
      setShowCreateModal(false)
      setFormData(emptyForm)
    } catch {
      // Error toast is already handled in mutation onError.
    }
  }

  const onEdit = async (event) => {
    event.preventDefault()
    if (!projectToEdit) return

    try {
      await updateProject.mutateAsync({
        id: projectToEdit.id,
        data: normalizeProjectPayload(formData)
      })

      setShowEditModal(false)
      setProjectToEdit(null)
      setFormData(emptyForm)
    } catch {
      // Error toast is already handled in mutation onError.
    }
  }

  const openEdit = (project) => {
    setProjectToEdit(project)
    setFormData({
      name: project.name || '',
      description: project.description || '',
      team: project.teamName || '',
      projectManagerId: project.projectManagerId || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
      deadline: project.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : '',
      priority: project.priority || 'MEDIUM',
      budget: project.budget ?? '',
      department: project.department || '',
      clientName: project.clientName || '',
      visibility: project.visibility || 'TEAM'
    })
    setShowEditModal(true)
    setMenuOpenFor(null)
  }

  const updateStatus = async (project, status) => {
    try {
      await updateProject.mutateAsync({ id: project.id, data: { status } })
      setMenuOpenFor(null)
    } catch {
      // Error toast is already handled in mutation onError.
    }
  }

  const removeProject = async (project) => {
    try {
      await deleteProject.mutateAsync(project.id)
      setMenuOpenFor(null)
    } catch {
      // Error toast is already handled in mutation onError.
    }
  }

  const openTaskModal = (project) => {
    setProjectForTask(project)
    setTaskFormData({
      ...emptyTaskForm,
      assigneeId: project.projectManagerId || project.ownerId || ''
    })
    setMenuOpenFor(null)
  }

  const openTasksList = (project) => {
    setProjectForTasks(project)
    setMenuOpenFor(null)
  }

  const onCreateTask = async (event) => {
    event.preventDefault()
    if (!projectForTask) return

    const payload = {
      title: taskFormData.title.trim(),
      description: taskFormData.description.trim(),
      priority: taskFormData.priority,
      dueDate: taskFormData.dueDate,
      assigneeId: taskFormData.assigneeId || undefined,
      tags: taskFormData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      attachments: taskFormData.attachments
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    try {
      await createTask.mutateAsync({ projectId: projectForTask.id, data: payload })
      setProjectForTask(null)
      setTaskFormData(emptyTaskForm)
    } catch {
      // Error toast is already handled in the mutation hook.
    }
  }

  const renderForm = (onSubmit, pending) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input label="Project Name *" value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
      <TextArea label="Description *" value={formData.description} onChange={(value) => setFormData({ ...formData, description: value })} rows={3} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Team *" value={formData.team} onChange={(value) => setFormData({ ...formData, team: value })} />
        <Select
          label="Project Manager *"
          value={formData.projectManagerId}
          onChange={(value) => setFormData({ ...formData, projectManagerId: value })}
          options={[{ label: 'Select manager', value: '' }, ...managerOptions.map((member) => ({ label: member.name, value: member.id }))]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input type="date" min={todayIso()} label="Start Date *" value={formData.startDate} onChange={(value) => setFormData({ ...formData, startDate: value })} />
        <Input type="date" min={formData.startDate || todayIso()} label="Deadline *" value={formData.deadline} onChange={(value) => setFormData({ ...formData, deadline: value })} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Priority *"
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value })}
          options={PRIORITY_OPTIONS.map((priority) => ({ label: priority, value: priority }))}
        />
        <Select
          label="Visibility"
          value={formData.visibility}
          onChange={(value) => setFormData({ ...formData, visibility: value })}
          options={VISIBILITY_OPTIONS.map((visibility) => ({ label: visibility, value: visibility }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input type="number" min="0" label="Budget" value={formData.budget} onChange={(value) => setFormData({ ...formData, budget: value })} />
        <Input label="Department" value={formData.department} onChange={(value) => setFormData({ ...formData, department: value })} />
        <Input label="Client Name" value={formData.clientName} onChange={(value) => setFormData({ ...formData, clientName: value })} />
      </div>

      <p className="rounded-lg border border-dashed border-gray-700 bg-gray-900/40 px-3 py-2 text-xs text-gray-400">
        Auto-generated: project key, id, created time, updated time, and progress percentage.
      </p>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false) }} className="flex-1 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800">
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending || !formData.name || !formData.description || !formData.team || !formData.projectManagerId || !formData.startDate || !formData.deadline}
          className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Projects</h1>
              <p className="text-sm text-gray-400">Manage and organize your team projects</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => { setFormData(emptyForm); setShowCreateModal(true) }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total Projects" value={counts.ALL} icon={FolderOpen} />
          <Stat title="Active Projects" value={counts.ACTIVE} icon={CheckCircle} />
          <Stat title="Completed" value={counts.COMPLETED} icon={Calendar} />
          <Stat title="Team Members" value={projects.reduce((sum, project) => sum + (project.members?.length || 0), 0)} icon={Users} />
        </div>

        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm">
          <Tab label="All Projects" active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')} />
          <Tab label="Active" active={activeTab === 'ACTIVE'} onClick={() => setActiveTab('ACTIVE')} />
          <Tab label="Completed" active={activeTab === 'COMPLETED'} onClick={() => setActiveTab('COMPLETED')} />
          <Tab label="Archived" active={activeTab === 'ARCHIVED'} onClick={() => setActiveTab('ARCHIVED')} />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-6 text-center text-gray-400">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-6 text-center text-gray-400">
            {isAdmin ? 'No projects in this tab.' : 'No assigned projects in this tab.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{project.projectKey || 'Auto Key Pending'}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{project.name}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  </div>

                  <div className="relative">
                    <button onClick={() => setMenuOpenFor(menuOpenFor === project.id ? null : project.id)} className="rounded-lg p-1.5 hover:bg-gray-800">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>

                    {menuOpenFor === project.id && isAdmin && (
                      <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
                        <button onClick={() => openTaskModal(project)} disabled={!canCreateTasks(project)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> New Task</button>
                        <button onClick={() => openTasksList(project)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"><FolderOpen className="h-4 w-4" /> View Tasks</button>
                        <button onClick={() => openEdit(project)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"><Edit2 className="h-4 w-4" /> Edit</button>
                        <button onClick={() => updateStatus(project, project.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"><CheckCircle className="h-4 w-4" /> {project.status === 'COMPLETED' ? 'Mark Active' : 'Mark Completed'}</button>
                        <button onClick={() => updateStatus(project, 'ARCHIVED')} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"><Archive className="h-4 w-4" /> Archive</button>
                        <button onClick={() => removeProject(project)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/20"><Trash2 className="h-4 w-4" /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Team" value={project.teamName || 'Not set'} />
                  <Info label="Manager" value={project.projectManager?.name || 'Not set'} />
                  <Info label="Priority" value={project.priority || 'MEDIUM'} />
                  <Info label="Deadline" value={project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'} />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                  <span className={clsx('rounded-full px-2 py-1 font-semibold', statusClass(project.status))}>{project.status}</span>
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <button onClick={() => openTaskModal(project)} disabled={!canCreateTasks(project)} className="text-emerald-300 hover:text-emerald-200 disabled:cursor-not-allowed disabled:text-gray-500">New Task</button>
                    )}
                    <button onClick={() => openTasksList(project)} className="text-indigo-300 hover:text-indigo-200">View Tasks ({project._count?.tasks || 0})</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{showEditModal ? 'Edit Project' : 'Create Project'}</h2>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false) }} className="rounded-lg p-1.5 hover:bg-gray-800"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            {showEditModal ? renderForm(onEdit, updateProject.isPending) : renderForm(onCreate, createProject.isPending)}
          </div>
        </div>
      )}

      {projectForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">New Task</h2>
                <p className="text-xs text-gray-400">Create a task inside {projectForTask.name}</p>
              </div>
              <button onClick={() => { setProjectForTask(null); setTaskFormData(emptyTaskForm) }} className="rounded-lg p-1.5 hover:bg-gray-800"><X className="h-4 w-4 text-gray-400" /></button>
            </div>

            <form onSubmit={onCreateTask} className="space-y-3">
              <Input label="Task Title *" value={taskFormData.title} onChange={(value) => setTaskFormData({ ...taskFormData, title: value })} />
              <TextArea label="Description" value={taskFormData.description} onChange={(value) => setTaskFormData({ ...taskFormData, description: value })} rows={3} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Assignee"
                  value={taskFormData.assigneeId}
                  onChange={(value) => setTaskFormData({ ...taskFormData, assigneeId: value })}
                  options={[
                    { label: 'Unassigned', value: '' },
                    { label: projectForTask.owner?.name ? `${projectForTask.owner.name} (Owner)` : 'Project owner', value: projectForTask.ownerId || '' },
                    { label: projectForTask.projectManager?.name ? `${projectForTask.projectManager.name} (Manager)` : 'Project manager', value: projectForTask.projectManagerId || '' },
                    ...((projectForTask.members || []).map((member) => ({ label: member.user?.name || 'Member', value: member.userId })))
                  ].filter((option, index, self) => option.value === '' || self.findIndex((item) => item.value === option.value) === index)}
                />
                <Select
                  label="Priority"
                  value={taskFormData.priority}
                  onChange={(value) => setTaskFormData({ ...taskFormData, priority: value })}
                  options={PRIORITY_OPTIONS.map((priority) => ({ label: priority, value: priority }))}
                />
              </div>

              <Input type="date" min={todayIso()} label="Due Date *" value={taskFormData.dueDate} onChange={(value) => setTaskFormData({ ...taskFormData, dueDate: value })} />
              <Input label="Tags, comma separated" value={taskFormData.tags} onChange={(value) => setTaskFormData({ ...taskFormData, tags: value })} />
              <Input label="Attachments, comma separated URLs" value={taskFormData.attachments} onChange={(value) => setTaskFormData({ ...taskFormData, attachments: value })} />

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setProjectForTask(null); setTaskFormData(emptyTaskForm) }} className="flex-1 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTask.isPending || !taskFormData.title.trim() || !taskFormData.dueDate}
                  className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectForTasks && (
        <ProjectTasksModal
          project={projectForTasks}
          onClose={() => setProjectForTasks(null)}
          onCreateTask={() => {
            const currentProject = projectForTasks
            setProjectForTasks(null)
            openTaskModal(currentProject)
          }}
          canCreateTask={canCreateTasks(projectForTasks)}
        />
      )}
    </Layout>
  )
}

function statusClass(status) {
  if (status === 'ACTIVE') return 'bg-emerald-500/10 text-emerald-300'
  if (status === 'COMPLETED') return 'bg-cyan-500/10 text-cyan-300'
  if (status === 'ARCHIVED') return 'bg-amber-500/10 text-amber-300'
  return 'bg-gray-500/10 text-gray-300'
}

function Stat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300"><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={clsx('rounded-lg px-3 py-1.5 font-medium transition', active ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-gray-200')}>
      {label}
    </button>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-2 py-2">
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm text-gray-200">{value}</p>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-300">{label}</label>
      <input {...props} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" />
    </div>
  )
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-300">{label}</label>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-300">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}

function ProjectTasksModal({ project, onClose, onCreateTask, canCreateTask }) {
  const { data: tasks = [], isLoading } = useTasks(project.id)

  const summary = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((task) => task.status === 'TODO').length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    inReview: tasks.filter((task) => task.status === 'IN_REVIEW').length,
    done: tasks.filter((task) => task.status === 'DONE').length
  }), [tasks])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl border border-gray-700 bg-gray-900 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Project tasks</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{project.name}</h2>
            <p className="mt-1 text-sm text-gray-400">See every task created for this project with its current status, due date, assignee, comments, and attachments.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCreateTask} disabled={!canCreateTask} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              New Task
            </button>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-800"><X className="h-4 w-4 text-gray-400" /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <MiniStat label="Total" value={summary.total} />
          <MiniStat label="Todo" value={summary.todo} />
          <MiniStat label="In progress" value={summary.inProgress} />
          <MiniStat label="Review" value={summary.inReview} />
          <MiniStat label="Done" value={summary.done} />
        </div>

        <div className="mt-4 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-6 text-center text-gray-400">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
              No tasks have been created for this project yet.
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-400">{task.description || 'No description provided.'}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="rounded-full bg-gray-800/80 px-3 py-1">Assignee: {task.assignee?.name || 'Unassigned'}</span>
                      <span className="rounded-full bg-gray-800/80 px-3 py-1">Comments: {task._count?.comments || 0}</span>
                      <span className="rounded-full bg-gray-800/80 px-3 py-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      {!!task.attachments?.length && <span className="rounded-full bg-gray-800/80 px-3 py-1">Attachments: {task.attachments.length}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    TODO: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
    IN_PROGRESS: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
    IN_REVIEW: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    DONE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
  }

  const label = {
    TODO: 'To do',
    IN_PROGRESS: 'In progress',
    IN_REVIEW: 'In review',
    DONE: 'Done'
  }[status] || status

  return <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', styles[status] || styles.TODO)}>{label}</span>
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    MEDIUM: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    HIGH: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    URGENT: 'border-rose-500/20 bg-rose-500/10 text-rose-300'
  }

  return <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', styles[priority] || styles.MEDIUM)}>{priority}</span>
}
