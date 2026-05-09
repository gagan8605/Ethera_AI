import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useSubmitSupportRequest } from '../hooks/useApi'
import { HelpCircle, MessageCircle, ShieldAlert, Ticket } from 'lucide-react'

export default function Support() {
  const supportRequest = useSubmitSupportRequest()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('General')
  const [message, setMessage] = useState('')
  const [ticketId, setTicketId] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await supportRequest.mutateAsync({ subject, category, message })
    setTicketId(response.data?.ticketId || '')
    setSubject('')
    setCategory('General')
    setMessage('')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Help & Support</h1>
          <p className="mt-2 text-gray-400">Reach out to the admin team or review common help topics.</p>
        </div>

        {ticketId && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            Support request submitted. Ticket ID: <span className="font-semibold">{ticketId}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Submit a request</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-300">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white"
                  placeholder="What do you need help with?"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white"
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
                  className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white placeholder:text-gray-500"
                  placeholder="Describe the issue or question in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={supportRequest.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" />
                {supportRequest.isPending ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <InfoCard icon={HelpCircle} title="Common issues" text="Password reset, project access, and task assignment help." />
            <InfoCard icon={MessageCircle} title="Contact channel" text="Support requests are delivered to the admin inbox instantly." />
            <InfoCard icon={Ticket} title="Response flow" text="Admins receive a ticket notification and can respond from the dashboard." />
          </div>
        </div>
      </div>
    </Layout>
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
