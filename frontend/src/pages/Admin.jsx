import React from 'react'
import Layout from '../components/Layout'
import { useQuery } from '@tanstack/react-query'
import { userAPI, dashboardAPI } from '../api/index.js'
import { useAuthStore } from '../store/authStore'
import { Activity, Users, FolderOpen, CheckSquare, Shield, Clock3 } from 'lucide-react'
import { format } from 'date-fns'

export default function Admin() {
  const { user } = useAuthStore()
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await userAPI.listUsers()).data,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 30000
  })

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await dashboardAPI.getStats()).data,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 30000
  })

  const activityQuery = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => (await dashboardAPI.getActivity()).data,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 30000
  })

  if (user?.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100">
          Admin access required.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Admin Panel</h1>
          <p className="mt-2 text-gray-400">System health, users, and operational activity.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Users} label="Users" value={usersQuery.data?.length || 0} />
          <StatCard icon={FolderOpen} label="Active Projects" value={statsQuery.data?.activeProjects || 0} />
          <StatCard icon={CheckSquare} label="Total Tasks" value={statsQuery.data?.totalTasks || 0} />
          <StatCard icon={Clock3} label="Overdue" value={statsQuery.data?.overdueCount || 0} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">User management</h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800 text-sm">
                <thead className="bg-gray-950/80 text-left text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Projects</th>
                    <th className="px-4 py-3 font-medium">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-950/40">
                  {(usersQuery.data || []).map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{member.role}</td>
                      <td className="px-4 py-3 text-gray-300">{member._count?.ownedProjects || 0}</td>
                      <td className="px-4 py-3 text-gray-300">{member._count?.assignedTasks || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            </div>

            <div className="space-y-3">
              {(activityQuery.data || []).slice(0, 10).map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{item.action}</p>
                      <p className="text-sm text-gray-400">{item.entity} • {item.user?.name || 'System'}</p>
                    </div>
                    <p className="text-xs text-gray-500">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
