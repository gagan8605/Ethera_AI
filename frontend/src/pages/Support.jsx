import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuthStore } from '../store/authStore'
import {
  useSubmitSupportRequest,
  useSupportTickets,
  useSupportTicket,
  useSupportTicketComment
} from '../hooks/useApi'
import { HelpCircle, MessageCircle, ShieldAlert, Ticket, Clock, MessageSquare, UserCircle2 } from 'lucide-react'
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

const formatStatus = (value) => value?.replaceAll('_', ' ')

export default function Support() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const supportRequest = useSubmitSupportRequest()
  const supportTicketsQuery = useSupportTickets({ scope: isAdmin ? 'all' : 'mine' })
  const commentMutation = useSupportTicketComment()
  const [searchParams, setSearchParams] = useSearchParams()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('General')
  const [message, setMessage] = useState('')
  const [screenshots, setScreenshots] = useState('')
  const [reply, setReply] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState(searchParams.get('ticket') || '')
  const [submittedTicketId, setSubmittedTicketId] = useState('')
  const [formError, setFormError] = useState('')

  const tickets = supportTicketsQuery.data?.tickets || []
  const activeTicketId = selectedTicketId || tickets[0]?.id || ''
  const activeTicketQuery = useSupportTicket(activeTicketId)
  const activeTicket = activeTicketQuery.data

  useEffect(() => {
    const urlTicket = searchParams.get('ticket')
    if (urlTicket && urlTicket !== selectedTicketId) {
      setSelectedTicketId(urlTicket)
    }
  }, [searchParams, selectedTicketId])

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [tickets, selectedTicketId])

  useEffect(() => {
    if (activeTicketId) {
      setSearchParams({ ticket: activeTicketId }, { replace: true })
    }
  }, [activeTicketId, setSearchParams])

  const stats = useMemo(() => supportTicketsQuery.data?.summary || {}, [supportTicketsQuery.data])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()

    if (trimmedSubject.length < 2) {
      setFormError('Subject must be at least 2 characters.')
      return
    }

    if (trimmedMessage.length < 5) {
      setFormError('Details must be at least 5 characters.')
      return
    }

    setFormError('')

    try {
      const response = await supportRequest.mutateAsync({
        subject: trimmedSubject,
        category,
        message: trimmedMessage,
        screenshots: screenshots
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      })
      const createdTicket = response.data?.ticket

      if (createdTicket?.id) {
        setSubmittedTicketId(createdTicket.id)
        setSelectedTicketId(createdTicket.id)
        setSearchParams({ ticket: createdTicket.id }, { replace: true })
      }

      setSubject('')
      setCategory('General')
      setMessage('')
      setScreenshots('')
    } catch (error) {
      setFormError(error.response?.data?.errors?.subject || error.response?.data?.errors?.message || error.response?.data?.message || 'Failed to submit support request')
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!activeTicketId) {
      return
    }

    await commentMutation.mutateAsync({ ticketId: activeTicketId, content: reply })
    setReply('')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{isAdmin ? 'Support Tickets' : 'Help & Support'}</h1>
          <p className="mt-2 text-gray-400">
            {isAdmin
              ? 'Review ticket conversations and respond to users from this workspace.'
              : 'Submit requests, track ticket progress, and continue the conversation in one place.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Total" value={stats.total || tickets.length || 0} />
          <MetricCard label="Open" value={stats.open || 0} />
          <MetricCard label="In Progress" value={stats.in_progress || 0} />
          <MetricCard label="Resolved" value={stats.resolved || 0} />
        </div>

        {!isAdmin && submittedTicketId && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            Support request submitted. Ticket ID: <span className="font-semibold">{submittedTicketId}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <div className="space-y-6">
            {!isAdmin ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Submit a request</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">Subject</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500"
                      placeholder="What do you need help with?"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500"
                    >
                      <option>General</option>
                      <option>Bug Report</option>
                      <option>Billing</option>
                      <option>Feature Request</option>
                      <option>Account Access</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">Details</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={7}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-500"
                      placeholder="Describe the issue or question in detail..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">Screenshots / links</label>
                    <textarea
                      value={screenshots}
                      onChange={(e) => setScreenshots(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-500"
                      placeholder="Paste screenshot URLs or cloud links separated by commas"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={supportRequest.isPending || subject.trim().length < 2 || message.trim().length < 5}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {supportRequest.isPending ? 'Submitting...' : 'Submit request'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
                <div className="flex items-start gap-3">
                  <Ticket className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Admin support workspace</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Admins do not submit requests from this page. Use the ticket thread below to review and reply.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Conversation</h2>
              </div>

              {!activeTicket ? (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
                  Select a ticket to view its thread.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{activeTicket.ticketNumber}</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">{activeTicket.subject}</h3>
                        <p className="mt-1 text-sm text-gray-400">{activeTicket.category}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Pill label={formatStatus(activeTicket.status)} className={STATUS_STYLES[activeTicket.status]} />
                        <Pill label={activeTicket.priority} className={PRIORITY_STYLES[activeTicket.priority]} />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <Meta label="Requester" value={activeTicket.requester?.name || 'You'} icon={UserCircle2} />
                      <Meta label="Assigned to" value={activeTicket.assignedTo?.name || 'Unassigned'} icon={UserCircle2} />
                      <Meta
                        label="Updated"
                        value={formatDistanceToNow(new Date(activeTicket.updatedAt), { addSuffix: true })}
                        icon={Clock}
                      />
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-sm leading-6 text-gray-300 whitespace-pre-wrap">
                      {activeTicket.message}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeTicket.comments?.length ? (
                      activeTicket.comments.map((comment) => (
                        <div key={comment.id} className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-white">{comment.author?.name || 'User'}</p>
                              <p className="text-xs text-gray-500">{comment.author?.role || 'Member'}</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
                        No replies yet.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleReply} className="rounded-xl border border-gray-800 bg-gray-950/50 p-4 space-y-3">
                    <label className="block text-sm text-gray-300">Add a reply</label>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-500"
                      placeholder="Reply with more details, answer a question, or confirm the issue is resolved..."
                    />
                    <button
                      type="submit"
                      disabled={commentMutation.isPending || !reply.trim()}
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

          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">{isAdmin ? 'Ticket queue' : 'My tickets'}</h2>
            </div>

            <div className="space-y-3">
              {supportTicketsQuery.isLoading ? (
                <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4 text-sm text-gray-400">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/40 p-6 text-center text-gray-400">
                  {isAdmin ? 'No support tickets match the current filters.' : 'You do not have any support tickets yet.'}
                </div>
              ) : (
                tickets.map((ticket) => {
                  const active = ticket.id === activeTicketId
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        active
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-gray-800 bg-gray-950/50 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{ticket.ticketNumber}</p>
                          <p className="mt-1 font-medium text-white">{ticket.subject}</p>
                          <p className="mt-1 text-xs text-gray-400">{ticket.category}</p>
                        </div>
                        <div className="text-right">
                          <Pill label={formatStatus(ticket.status)} className={STATUS_STYLES[ticket.status]} />
                          <p className="mt-2 text-xs text-gray-500">{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="mt-6 space-y-4">
              <InfoCard icon={HelpCircle} title="Common issues" text="Password reset, project access, and task assignment help." />
              <InfoCard icon={MessageCircle} title="Contact channel" text="Support requests are delivered to the admin inbox instantly." />
              <InfoCard icon={Ticket} title="Response flow" text="Admins receive ticket notifications and can continue the thread from the Admin panel." />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function Pill({ label, className }) {
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

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{text}</p>
        </div>
      </div>
    </div>
  )
}