import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../api/index.js'
import {
  useSupportTickets,
  useSupportTicket,
  useSupportTicketComment,
  useUpdateSupportTicketStatus,
  useAssignSupportTicket
} from '../hooks/useApi'
import { useAuthStore } from '../store/authStore'
import { Clock3, Ticket, Search, ArrowRight, MessageSquare, UserCircle2, GitBranch } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_STYLES = {
  OPEN: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  WAITING_FOR_CUSTOMER: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  CLOSED: 'bg-gray-500/10 text-gray-300 border-gray-500/20'
}

const PRIORITY_STYLES = {
  LOW: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  MEDIUM: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  HIGH: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  URGENT: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']

const formatStatus = (value) => value?.replaceAll('_', ' ')

export default function Admin() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketStatusFilter, setTicketStatusFilter] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState(searchParams.get('ticket') || '')
  const [statusDraft, setStatusDraft] = useState('OPEN')
  const [assigneeDraft, setAssigneeDraft] = useState('')
  const [commentDraft, setCommentDraft] = useState('')

  const adminUsersQuery = useQuery({
    queryKey: ['admin-assign-users'],
    queryFn: async () => (await userAPI.listUsers()).data,
    enabled: user?.role === 'ADMIN',
    refetchInterval: 30000
  })

  const supportTicketsQuery = useSupportTickets({
    scope: 'all',
    status: ticketStatusFilter || undefined,
    search: ticketSearch || undefined
  })

  const selectedTicketQuery = useSupportTicket(selectedTicketId)
  const statusMutation = useUpdateSupportTicketStatus()
  const assignMutation = useAssignSupportTicket()
  const commentMutation = useSupportTicketComment()

  const admins = useMemo(
    () => (adminUsersQuery.data || []).filter((member) => member.role === 'ADMIN'),
    [adminUsersQuery.data]
  )

  const supportTickets = supportTicketsQuery.data?.tickets || []
  const supportSummary = supportTicketsQuery.data?.summary || {}
  const selectedTicket = selectedTicketQuery.data

  useEffect(() => {
    const urlTicket = searchParams.get('ticket')
    if (urlTicket && urlTicket !== selectedTicketId) {
      setSelectedTicketId(urlTicket)
    }
  }, [searchParams, selectedTicketId])

  useEffect(() => {
    if (!selectedTicketId && supportTickets.length > 0) {
      setSelectedTicketId(supportTickets[0].id)
    }
  }, [supportTickets, selectedTicketId])

  useEffect(() => {
    if (selectedTicketId) {
      setSearchParams({ ticket: selectedTicketId }, { replace: true })
    }
  }, [selectedTicketId, setSearchParams])

  useEffect(() => {
    if (selectedTicket) {
      setStatusDraft(selectedTicket.status)
      setAssigneeDraft(selectedTicket.assignedToId || '')
    }
  }, [selectedTicket])

  if (user?.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100">
          Admin access required.
        </div>
      </Layout>
    )
  }

  const handleUpdateStatus = async () => {
    if (!selectedTicketId) return
    await statusMutation.mutateAsync({ ticketId: selectedTicketId, status: statusDraft })
  }

  const handleAssign = async (assignedToId) => {
    if (!selectedTicketId) return
    await assignMutation.mutateAsync({ ticketId: selectedTicketId, assignedToId })
  }

  const handleComment = async (event) => {
    event.preventDefault()
    if (!selectedTicketId || !commentDraft.trim()) return
    await commentMutation.mutateAsync({ ticketId: selectedTicketId, content: commentDraft })
    setCommentDraft('')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Support Ticket Management</h1>
          <p className="mt-2 text-gray-400">Admins work tickets here only. No user dashboard widgets or general activity feed.</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Support tickets</h2>
              </div>
              <p className="mt-1 text-sm text-gray-400">Tickets from all users, with full conversation and admin actions.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge label={`Total ${supportSummary.total || 0}`} />
              <Badge label={`Open ${supportSummary.open || 0}`} />
              <Badge label={`In progress ${supportSummary.in_progress || 0}`} />
              <Badge label={`Resolved ${supportSummary.resolved || 0}`} />
            </div>
          </div>

          <div className="mb-4 grid gap-3 lg:grid-cols-[1.1fr_0.5fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={ticketSearch}
                onChange={(event) => setTicketSearch(event.target.value)}
                placeholder="Search tickets by subject, message, or ticket number"
                className="w-full rounded-xl border border-gray-700 bg-gray-950/60 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <select
              value={ticketStatusFilter}
              onChange={(event) => setTicketStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{formatStatus(status)}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {supportTicketsQuery.isLoading ? (
                <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4 text-sm text-gray-400">Loading tickets...</div>
              ) : supportTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
                  No tickets match the current filters.
                </div>
              ) : (
                supportTickets.map((ticket) => {
                  const active = ticket.id === selectedTicketId
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        active
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-gray-800 bg-gray-950/50 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{ticket.ticketNumber}</p>
                          <p className="mt-1 truncate font-medium text-white">{ticket.subject}</p>
                          <p className="mt-1 text-xs text-gray-400">{ticket.category}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <MiniPill label={formatStatus(ticket.status)} className={STATUS_STYLES[ticket.status]} />
                            <MiniPill label={ticket.priority} className={PRIORITY_STYLES[ticket.priority]} />
                            {ticket.assignedTo?.name && <MiniPill label={ticket.assignedTo.name} className="bg-white/5 text-gray-300 border-gray-700" />}
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{ticket.requester?.name || 'Unknown'}</p>
                          <p className="mt-1">{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
              {!selectedTicket ? (
                <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-950/40 text-gray-400">
                  Select a ticket to manage it.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{selectedTicket.ticketNumber}</p>
                        <h3 className="mt-1 text-2xl font-semibold text-white">{selectedTicket.subject}</h3>
                        <p className="mt-1 text-sm text-gray-400">{selectedTicket.category}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <MiniPill label={formatStatus(selectedTicket.status)} className={STATUS_STYLES[selectedTicket.status]} />
                        <MiniPill label={selectedTicket.priority} className={PRIORITY_STYLES[selectedTicket.priority]} />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <Meta label="Requester" value={selectedTicket.requester?.name || 'Unknown'} icon={UserCircle2} />
                      <Meta label="Assigned to" value={selectedTicket.assignedTo?.name || 'Unassigned'} icon={GitBranch} />
                      <Meta
                        label="Updated"
                        value={formatDistanceToNow(new Date(selectedTicket.updatedAt), { addSuffix: true })}
                        icon={Clock3}
                      />
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-sm leading-6 text-gray-300 whitespace-pre-wrap">
                      {selectedTicket.message}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                    <div>
                      <label className="mb-2 block text-sm text-gray-300">Change status</label>
                      <select
                        value={statusDraft}
                        onChange={(event) => setStatusDraft(event.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{formatStatus(status)}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={statusMutation.isPending}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-950 disabled:opacity-50"
                      >
                        <ArrowRight className="h-4 w-4" />
                        {statusMutation.isPending ? 'Saving...' : 'Update status'}
                      </button>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">Assign ticket</label>
                      <select
                        value={assigneeDraft}
                        onChange={(event) => setAssigneeDraft(event.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
                      >
                        <option value="">Assign to me</option>
                        {admins.map((admin) => (
                          <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                      </select>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAssign(assigneeDraft || undefined)}
                          disabled={assignMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 disabled:opacity-50"
                        >
                          <UserCircle2 className="h-4 w-4" />
                          {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssign(user.id)}
                          disabled={assignMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Assign to me
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedTicket.comments?.length ? (
                      selectedTicket.comments.map((comment) => (
                        <div key={comment.id} className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-white">{comment.author?.name || 'User'}</p>
                              <p className="text-xs text-gray-500">{comment.author?.role || 'Member'}</p>
                            </div>
                            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
                        No comments yet.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleComment} className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/50 p-4">
                    <label className="block text-sm text-gray-300">Add a public reply</label>
                    <textarea
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-amber-500"
                      placeholder="Reply to the requester or add next steps..."
                    />
                    <button
                      type="submit"
                      disabled={commentMutation.isPending || !commentDraft.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 disabled:opacity-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {commentMutation.isPending ? 'Sending...' : 'Send reply'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Badge({ label }) {
  return <span className="inline-flex rounded-full border border-gray-700 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">{label}</span>
}

function MiniPill({ label, className }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${className}`}>{label}</span>
}

function Meta({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-3">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon className="h-4 w-4" />
        <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}