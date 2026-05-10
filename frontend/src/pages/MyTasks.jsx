import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, formatDistanceToNow, isAfter, isBefore, isToday, startOfDay } from 'date-fns'
import Layout from '../components/Layout'
import { useDashboardMyTasks, useUpdateTaskStatus } from '../hooks/useApi'
import { CalendarDays, CheckCircle2, CircleDashed, Clock3, Filter, FolderOpen, Layers3, ListTodo, Search, X, Paperclip, MessageSquare, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const STATUS_LABELS = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  IN_REVIEW: 'In review',
  DONE: 'Done'
}

const FILTER_OPTIONS = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'TODAY', label: 'Due today' },
  { id: 'DONE', label: 'Done' },
  { id: 'REVIEW', label: 'Review' }
]

const SORT_OPTIONS = [
  { id: 'due-asc', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
  { id: 'project', label: 'Project' }
]

export default function MyTasks() {
  const { data: tasks = [], isLoading } = useDashboardMyTasks()
  const updateStatus = useUpdateTaskStatus()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('due-asc')
  const [selectedTask, setSelectedTask] = useState(null)

  const enrichedTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const matchesFilter = (task) => {
      if (filter === 'ALL') return true
      if (filter === 'DONE') return task.status === 'DONE'
      if (filter === 'REVIEW') return task.status === 'IN_REVIEW'
      if (filter === 'ACTIVE') return task.status !== 'DONE'
      if (filter === 'OVERDUE') return task.dueDate && isBefore(new Date(task.dueDate), startOfDay(new Date())) && task.status !== 'DONE'
      if (filter === 'TODAY') return task.dueDate && isToday(new Date(task.dueDate))
      return true
    }

    const matchesSearch = (task) => {
      if (!normalizedSearch) return true
      const haystack = [
        task.title,
        task.description,
        task.project?.name,
        task.creator?.name,
        ...(task.tags || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    }

    const priorityRank = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

    return tasks
      .filter((task) => matchesFilter(task) && matchesSearch(task))
      .sort((a, b) => {
        if (sortBy === 'project') {
          return (a.project?.name || '').localeCompare(b.project?.name || '')
        }

        if (sortBy === 'priority') {
          return (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99)
        }

        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
        return aDue - bDue
      })
  }, [tasks, filter, search, sortBy])

  const stats = useMemo(() => {
    const now = startOfDay(new Date())
    return {
      total: tasks.length,
      done: tasks.filter((task) => task.status === 'DONE').length,
      overdue: tasks.filter((task) => task.dueDate && isBefore(new Date(task.dueDate), now) && task.status !== 'DONE').length,
      dueToday: tasks.filter((task) => task.dueDate && isToday(new Date(task.dueDate))).length,
      highPriority: tasks.filter((task) => ['HIGH', 'URGENT'].includes(task.priority)).length
    }
  }, [tasks])

  const openTask = (task) => setSelectedTask(task)
  const closeTask = () => setSelectedTask(null)

  const handleChangeStatus = (task, newStatus) => {
    if (task.status === newStatus) return
    updateStatus.mutate({ projectId: task.project.id, taskId: task.id, status: newStatus })
  }

  const selectedTaskProjectId = selectedTask?.project?.id

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Personal workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-text-primary">My Tasks</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">Track work assigned to you, move tasks forward faster, and jump into the project context without hunting around.</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <StatPill icon={ListTodo} label="Total" value={stats.total} />
            <StatPill icon={CheckCircle2} label="Done" value={stats.done} />
            <StatPill icon={Clock3} label="Overdue" value={stats.overdue} tone="rose" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={ListTodo} label="Total tasks" value={stats.total} hint="Assigned to you" />
          <MetricCard icon={CheckCircle2} label="Completed" value={stats.done} hint={`${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}% done`} />
          <MetricCard icon={Clock3} label="Due today" value={stats.dueToday} hint="Needs attention today" />
          <MetricCard icon={CircleDashed} label="Overdue" value={stats.overdue} hint="Past deadline" tone="rose" />
          <MetricCard icon={Layers3} label="High priority" value={stats.highPriority} hint="Urgent or high" tone="amber" />
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, projects, tags, or people"
                className="w-full rounded-xl border border-gray-700 bg-gray-950/60 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-950/60 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-3">
          {isLoading ? (
            <PanelMessage icon={ListTodo} title="Loading tasks…" text="Pulling your assigned work into view." />
          ) : enrichedTasks.length === 0 ? (
            <PanelMessage
              icon={Search}
              title="No tasks found"
              text="Try a different filter or clear the search box."
            />
          ) : (
            enrichedTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => openTask(task)}
                className={clsx(
                  'w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-500/40',
                  task.status === 'DONE'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : task.dueDate && isBefore(new Date(task.dueDate), startOfDay(new Date()))
                      ? 'border-rose-500/20 bg-rose-500/5'
                      : 'border-gray-800 bg-gray-900/80'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-12 w-1 rounded-full" style={{ background: task.project?.color || '#6366f1' }} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/projects/${task.project.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                      >
                        {task.project.name}
                      </Link>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{task.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                          {task.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="text-right text-xs text-gray-500">
                        <p>{task.creator?.name ? `Created by ${task.creator.name}` : 'Created by team'}</p>
                        <p className="mt-1">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {task.dueDate ? (
                        <span className={clsx('inline-flex items-center gap-1 rounded-full px-3 py-1', dueTone(task.dueDate, task.status))}>
                          <CalendarDays className="h-3.5 w-3.5" />
                          Due {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-800/80 px-3 py-1 text-gray-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                          No due date
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-800/80 px-3 py-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {task._count?.comments || 0} comments
                      </span>

                      {!!task.attachments?.length && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-800/80 px-3 py-1">
                          <Paperclip className="h-3.5 w-3.5" />
                          {task.attachments.length} attachments
                        </span>
                      )}

                      {task.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
          </div>

          <div className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-indigo-400">Task details</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{selectedTask ? selectedTask.title : 'Select a task'}</h2>
                </div>
                {selectedTask && (
                  <button onClick={closeTask} className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!selectedTask ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
                  Pick a task to see its status, project context, and quick actions.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Project</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <Link to={`/projects/${selectedTaskProjectId}`} className="font-semibold text-indigo-300 hover:text-indigo-200">
                          {selectedTask.project.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-400">{selectedTask.creator?.name ? `Created by ${selectedTask.creator.name}` : 'Created by team'}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl" style={{ background: selectedTask.project?.color || '#6366f1' }} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Meta label="Priority" value={selectedTask.priority} />
                      <Meta label="Status" value={STATUS_LABELS[selectedTask.status] || selectedTask.status} />
                      <Meta label="Comments" value={String(selectedTask._count?.comments || 0)} />
                      <Meta label="Created" value={formatDistanceToNow(new Date(selectedTask.createdAt), { addSuffix: true })} />
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/80 p-3 text-sm leading-6 text-gray-300">
                      {selectedTask.description || 'No description provided.'}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedTask.tags?.length ? selectedTask.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">#{tag}</span>
                      )) : <span className="text-sm text-gray-500">No tags</span>}
                    </div>

                    {!!selectedTask.attachments?.length && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Attachments</p>
                        <div className="flex flex-col gap-2">
                          {selectedTask.attachments.map((item) => (
                            <span key={item} className="truncate rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4">
                    <p className="text-sm font-semibold text-white">Quick actions</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleChangeStatus(selectedTask, 'TODO')}
                        disabled={updateStatus.isLoading}
                        className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:border-indigo-500/40"
                      >
                        To do
                      </button>
                      <button
                        onClick={() => handleChangeStatus(selectedTask, 'IN_PROGRESS')}
                        disabled={updateStatus.isLoading}
                        className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:border-indigo-500/40"
                      >
                        Start work
                      </button>
                      <button
                        onClick={() => handleChangeStatus(selectedTask, 'IN_REVIEW')}
                        disabled={updateStatus.isLoading}
                        className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:border-indigo-500/40"
                      >
                        Send to review
                      </button>
                      <button
                        onClick={() => handleChangeStatus(selectedTask, 'DONE')}
                        disabled={updateStatus.isLoading}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 hover:border-emerald-400/40"
                      >
                        Mark done
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <select
                        className="flex-1 rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2 text-sm text-white outline-none"
                        value={selectedTask.status}
                        onChange={(event) => handleChangeStatus(selectedTask, event.target.value)}
                        disabled={updateStatus.isLoading}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleChangeStatus(selectedTask, selectedTask.status)}
                        className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        Sync
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4 text-sm text-gray-400">
                    Tip: open the project link to see the full team context, or use the task status dropdown to move work forward in one click.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-gray-800 bg-gray-950 p-4">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-700" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-400">Task details</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{selectedTask.title}</h2>
              </div>
              <button onClick={closeTask} className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
                <Link to={`/projects/${selectedTask.project.id}`} className="font-semibold text-indigo-300 hover:text-indigo-200">
                  {selectedTask.project.name}
                </Link>
                <p className="mt-2 text-sm text-gray-400">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2 text-sm text-white outline-none"
                    value={selectedTask.status}
                    onChange={(event) => handleChangeStatus(selectedTask, event.target.value)}
                    disabled={updateStatus.isLoading}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function StatPill({ icon: Icon, label, value, tone = 'indigo' }) {
  return (
    <div className={clsx('flex items-center gap-2 rounded-full border px-3 py-2', tone === 'rose' ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-gray-700 bg-gray-900/80 text-gray-200')}>
      <Icon className="h-4 w-4" />
      <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      <strong className="text-sm">{value}</strong>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone = 'indigo' }) {
  return (
    <div className={clsx('rounded-2xl border p-4', tone === 'rose' ? 'border-rose-500/20 bg-rose-500/5' : tone === 'amber' ? 'border-amber-500/20 bg-amber-500/5' : 'border-gray-800 bg-gray-900/80')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3 text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function PanelMessage({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/60 p-8 text-center text-gray-400">
      <Icon className="mx-auto h-8 w-8 text-gray-500" />
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{text}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    TODO: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    IN_PROGRESS: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    IN_REVIEW: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    DONE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  }

  return <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', styles[status] || styles.TODO)}>{STATUS_LABELS[status] || status}</span>
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    MEDIUM: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    HIGH: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    URGENT: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
  }

  return <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', styles[priority] || styles.MEDIUM)}>{priority}</span>
}

function Meta({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function dueTone(dueDate, status) {
  if (status === 'DONE') return 'bg-emerald-500/10 text-emerald-300'
  const due = new Date(dueDate)
  if (isBefore(due, startOfDay(new Date()))) return 'bg-rose-500/10 text-rose-300'
  if (isToday(due)) return 'bg-amber-500/10 text-amber-300'
  if (isAfter(due, startOfDay(new Date()))) return 'bg-indigo-500/10 text-indigo-300'
  return 'bg-gray-500/10 text-gray-300'
}
