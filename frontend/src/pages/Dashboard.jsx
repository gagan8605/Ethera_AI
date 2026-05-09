import React, { useMemo } from 'react'
import { useDashboardStats, useActivityFeed, useNotifications } from '../hooks/useApi'
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  FolderOpen, 
  Clock, 
  Users, 
  Calendar,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap
} from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { formatDistanceToNow, format } from 'date-fns'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activityFeed, isLoading: activityLoading } = useActivityFeed()
  const { data: notifications, isLoading: notificationsLoading } = useNotifications()

  // Mock data - replace with real API data
  const weeklyData = useMemo(() => [
    { date: 'Mon', tasks: 4, completed: 3, pending: 1 },
    { date: 'Tue', tasks: 6, completed: 5, pending: 1 },
    { date: 'Wed', tasks: 5, completed: 4, pending: 1 },
    { date: 'Thu', tasks: 8, completed: 7, pending: 1 },
    { date: 'Fri', tasks: 12, completed: 10, pending: 2 },
    { date: 'Sat', tasks: 2, completed: 2, pending: 0 },
    { date: 'Sun', tasks: 1, completed: 1, pending: 0 }
  ], [])

  const taskStatusData = useMemo(() => [
    { name: 'To Do', value: 24, color: '#6366f1', percentage: 24 },
    { name: 'In Progress', value: 12, color: '#f59e0b', percentage: 12 },
    { name: 'In Review', value: 8, color: '#8b5cf6', percentage: 8 },
    { name: 'Done', value: 56, color: '#10b981', percentage: 56 }
  ], [])

  const priorityDistribution = useMemo(() => [
    { priority: 'High', count: 14, color: '#ef4444' },
    { priority: 'Medium', count: 23, color: '#f59e0b' },
    { priority: 'Low', count: 31, color: '#10b981' }
  ], [])

  const productivityScore = 87
  const productivityChange = +12

  const statCards = useMemo(() => [
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 128,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: '#6366f1',
      bg: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5'
    },
    {
      title: 'Completed',
      value: stats?.completedToday || 56,
      change: '+23%',
      trend: 'up',
      subtitle: 'of 128 total',
      icon: TrendingUp,
      color: '#10b981',
      bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
    },
    {
      title: 'Overdue Tasks',
      value: stats?.overdueCount || 8,
      change: '-5%',
      trend: 'down',
      icon: AlertCircle,
      color: '#ef4444',
      bg: 'bg-gradient-to-br from-red-500/10 to-red-600/5'
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 12,
      change: '+2',
      trend: 'up',
      icon: FolderOpen,
      color: '#f59e0b',
      bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5'
    }
  ], [stats])

  // Format time for activity
  const formatActivityTime = (date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const hours = diff / (1000 * 60 * 60)
    if (hours < 24) return formatDistanceToNow(new Date(date), { addSuffix: true })
    return format(new Date(date), 'MMM d, h:mm a')
  }

  // Get activity icon based on action
  const getActivityIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'created': return <CheckCircle className="w-3 h-3" />
      case 'completed': return <ThumbsUp className="w-3 h-3" />
      case 'commented': return <MessageSquare className="w-3 h-3" />
      default: return <Eye className="w-3 h-3" />
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header with Welcome Section */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Welcome back! Here's your project overview and analytics.
              </p>
            </div>
            
            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Productivity Score
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{productivityScore}%</span>
                  <div className={`flex items-center gap-1 text-xs ${productivityChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {productivityChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(productivityChange)}%
                  </div>
                </div>
              </div>
              
              <button className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Stats Grid with Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon
              const isPositive = card.trend === 'up'
              return (
                <div 
                  key={card.title} 
                  className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Gradient Border Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-gray-200 dark:group-hover:via-gray-700 transition-all duration-300" />
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${card.bg} p-3 rounded-xl`}>
                        <Icon className="w-6 h-6" style={{ color: card.color }} />
                      </div>
                      {card.change && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {card.change}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.title}</p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">
                        {card.value.toLocaleString()}
                      </p>
                      {card.subtitle && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subtitle}</p>
                      )}
                    </div>

                    {/* Mini Progress Bar for Total Tasks */}
                    {card.title === 'Total Tasks' && (
                      <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: '43%' }} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Section with Enhanced Design */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Completion Trend - Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Completion Trend</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Weekly performance overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">
                    Weekly
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                    Monthly
                  </button>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    className="dark:bg-gray-800"
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#6366f1" fill="url(#colorTasks)" strokeWidth={2} />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#colorCompleted)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution - Enhanced Pie Chart */}
            <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Distribution</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">By current status</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie 
                    data={taskStatusData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    paddingAngle={2}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="white" className="dark:stroke-gray-800" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {taskStatusData.map((status) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{status.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Activity Feed and Priority Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Activity Feed */}
            <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest team updates</p>
                  </div>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {activityFeed?.slice(0, 5).map((activity, index) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md"
                          style={{ backgroundColor: activity.user?.avatar || '#6366f1' }}
                        >
                          {activity.user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {activity.user?.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {activity.action.toLowerCase()}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            {activity.entity}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatActivityTime(activity.createdAt)}
                        </p>
                      </div>
                      
                      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getActivityIcon(activity.action)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  View All Activity →
                </button>
              </div>
            </div>

            {/* Priority Matrix & Quick Actions */}
            <div className="space-y-6">
              {/* Priority Distribution */}
              <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Breakdown</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Task priority distribution</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  {priorityDistribution.map((priority) => (
                    <div key={priority.priority} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priority.color }} />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{priority.priority}</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-semibold">{priority.count} tasks</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(priority.count / priorityDistribution.reduce((sum, p) => sum + p.count, 0)) * 100}%`,
                            backgroundColor: priority.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Need to catch up?</h3>
                <p className="text-indigo-100 text-sm mb-4">You have 8 overdue tasks. Let's get them done!</p>
                <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors shadow-md">
                  Review Overdue Tasks →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}