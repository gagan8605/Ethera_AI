import React, { useMemo } from 'react'
import Layout from '../components/Layout'
import { useCalendarEvents } from '../hooks/useApi'
import { format, isBefore, startOfDay } from 'date-fns'
import { CalendarDays, Clock3, Flag, FolderOpen, CheckCircle2 } from 'lucide-react'

export default function Calendar() {
  const { data, isLoading } = useCalendarEvents()

  const groupedEvents = useMemo(() => {
    const events = data?.events || []
    return events.reduce((acc, event) => {
      const key = format(new Date(event.date), 'yyyy-MM-dd')
      if (!acc[key]) acc[key] = []
      acc[key].push(event)
      return acc
    }, {})
  }, [data])

  const sortedDays = Object.keys(groupedEvents).sort()

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Schedule</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Calendar</h1>
          <p className="mt-2 text-gray-400">Deadlines, milestones, and due tasks across your workspace.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={CalendarDays} label="Total Events" value={data?.summary?.totalEvents || 0} />
          <StatCard icon={Clock3} label="Upcoming" value={data?.summary?.upcomingEvents || 0} />
          <StatCard icon={Flag} label="Task Events" value={data?.summary?.taskEvents || 0} />
          <StatCard icon={FolderOpen} label="Project Deadlines" value={data?.summary?.projectDeadlines || 0} />
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upcoming schedule</h2>
            <CheckCircle2 className="h-4 w-4 text-violet-400" />
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">Loading calendar events...</div>
          ) : sortedDays.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">No upcoming events.</div>
          ) : (
            <div className="space-y-4">
              {sortedDays.map((day) => (
                <div key={day} className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{format(new Date(day), 'EEEE')}</p>
                      <h3 className="text-xl font-semibold text-white">{format(new Date(day), 'MMM d, yyyy')}</h3>
                    </div>
                    <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
                      {groupedEvents[day].length} item{groupedEvents[day].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groupedEvents[day].map((event) => {
                      const overdue = isBefore(new Date(event.date), startOfDay(new Date())) && event.type === 'TASK' && event.status !== 'DONE'
                      return (
                        <div key={`${event.type}-${event.id}`} className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-white" style={{ backgroundColor: event.type === 'TASK' ? '#8b5cf6' : '#0ea5e9' }}>
                                  {event.type}
                                </span>
                                {overdue && <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300">OVERDUE</span>}
                              </div>
                              <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                              <p className="text-sm text-gray-400">
                                {event.project?.name || event.project?.title || 'Project deadline'}
                                {event.assignee ? ` • ${event.assignee.name}` : ''}
                              </p>
                            </div>

                            <div className="grid gap-2 text-sm text-gray-300 md:text-right">
                              <p><span className="text-gray-500">Priority:</span> {event.priority || '—'}</p>
                              <p><span className="text-gray-500">Status:</span> {event.status || event.project?.status || '—'}</p>
                              <p><span className="text-gray-500">Due:</span> {format(new Date(event.date), 'hh:mm a')}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
