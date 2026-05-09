import React, { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useTeamOverview } from '../hooks/useApi'
import { FolderOpen, Mail, Search, Shield, Users, CheckSquare, Crown, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Team() {
  const { data, isLoading } = useTeamOverview()
  const [search, setSearch] = useState('')

  const members = data?.members || []
  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return members
    return members.filter((member) => {
      const haystack = [member.name, member.email, member.role, ...(member.roles || [])].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [members, search])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-purple-400">Workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Team</h1>
            <p className="mt-2 text-gray-400">People, projects, and workload across your workspace.</p>
          </div>
          <Link
            to="/messages"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01]"
          >
            <MessageSquare className="h-4 w-4" />
            Message Team
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Users} label="Team Members" value={data?.summary?.totalMembers || 0} />
          <StatCard icon={FolderOpen} label="Projects" value={data?.summary?.totalProjects || 0} />
          <StatCard icon={CheckSquare} label="Tasks" value={data?.summary?.totalTasks || 0} />
          <StatCard icon={Shield} label="Active Projects" value={data?.summary?.activeProjects || 0} />
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Team roster</h2>
              <p className="text-sm text-gray-400">Everyone across projects you can access.</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, role"
                className="w-full rounded-xl border border-gray-700 bg-gray-950/60 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">Loading team...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">No members found.</div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4 transition hover:border-purple-500/40 hover:bg-gray-950">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} avatar={member.avatar} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{member.name}</h3>
                          {member.role === 'ADMIN' && <Crown className="h-4 w-4 text-amber-400" />}
                        </div>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300">
                      {member.role}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <InfoPill label="Projects" value={member.projectCount} />
                    <InfoPill label="Tasks" value={member.taskCount} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(member.roles || []).map((role) => (
                      <span key={role} className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300">
                        {role}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {member.projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2 text-sm">
                        <div>
                          <p className="text-white">{project.name}</p>
                          <p className="text-xs text-gray-400">{project.role}</p>
                        </div>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
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
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-900/80 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function Avatar({ name, avatar }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-700 text-sm font-semibold text-white" style={{ backgroundColor: avatar || '#6366f1' }}>
      {name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()}
    </div>
  )
}
