import React from 'react'
import Layout from '../components/Layout'
import { useAnalyticsOverview } from '../hooks/useApi'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts'
import { Activity, CheckCircle2, Clock3, FolderOpen, Target, TrendingUp } from 'lucide-react'

const STATUS_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e']
const PRIORITY_COLORS = ['#64748b', '#0ea5e9', '#f97316', '#ef4444']

export default function Analytics() {
  const { data, isLoading } = useAnalyticsOverview()

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Insights</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-gray-400">Project health, task performance, and completion trends.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Target} label="Completion Rate" value={`${data?.stats?.completionRate || 0}%`} />
          <StatCard icon={Activity} label="Total Tasks" value={data?.stats?.totalTasks || 0} />
          <StatCard icon={Clock3} label="Overdue" value={data?.stats?.overdueTasks || 0} />
          <StatCard icon={FolderOpen} label="Active Projects" value={data?.stats?.activeProjects || 0} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Task Status">
            <ChartShell loading={isLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data?.statusChart || []} dataKey="count" nameKey="status" innerRadius={70} outerRadius={110} paddingAngle={4}>
                    {(data?.statusChart || []).map((entry, index) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartShell>
          </Panel>

          <Panel title="Priority Distribution">
            <ChartShell loading={isLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.priorityChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="priority" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {(data?.priorityChart || []).map((entry, index) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Weekly Completion">
            <ChartShell loading={isLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.completionTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartShell>
          </Panel>

          <Panel title="Project Progress">
            <div className="space-y-3">
              {(data?.projectProgress || []).map((project) => (
                <div key={project.id} className="rounded-xl border border-gray-800 bg-gray-950/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-white">{project.name}</p>
                    <p className="text-gray-400">{project.percentage}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-800">
                    <div className="h-2 rounded-full" style={{ width: `${project.percentage}%`, backgroundColor: project.color }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{project.completed}/{project.total} tasks completed</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Layout>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <TrendingUp className="h-4 w-4 text-purple-400" />
      </div>
      {children}
    </div>
  )
}

function ChartShell({ loading, children }) {
  if (loading) {
    return <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-gray-700 text-gray-400">Loading analytics...</div>
  }
  return children
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
