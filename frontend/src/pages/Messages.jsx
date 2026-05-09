import React, { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useMessages, useSendMessage, useTeamOverview } from '../hooks/useApi'
import { format } from 'date-fns'
import { Send, Inbox, SendHorizonal, UserRound } from 'lucide-react'

export default function Messages() {
  const { data: messages, isLoading } = useMessages()
  const { data: teamData } = useTeamOverview()
  const sendMessage = useSendMessage()
  const [recipientId, setRecipientId] = useState('')
  const [content, setContent] = useState('')

  const recipients = useMemo(() => teamData?.members || [], [teamData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!recipientId || !content.trim()) return
    await sendMessage.mutateAsync({ recipientId, content })
    setContent('')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pink-400">Communication</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Messages</h1>
          <p className="mt-2 text-gray-400">Send team updates and view inbox activity.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <SendHorizonal className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">Compose message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-300">Recipient</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white"
                >
                  <option value="">Select a teammate</option>
                  {recipients.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Share an update, ask a question, or request a review..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white placeholder:text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={sendMessage.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sendMessage.isPending ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Inbox className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Inbox & outbox</h2>
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">Loading messages...</div>
            ) : (messages || []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-400">No messages yet.</div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="rounded-xl border border-gray-800 bg-gray-950/50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-pink-500/10 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-pink-300">
                          {message.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{format(new Date(message.createdAt), 'MMM d, h:mm a')}</p>
                    </div>
                    <p className="text-sm text-gray-200">{message.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
