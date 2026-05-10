import React from 'react'
import Layout from '../components/Layout'
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotifications, useDeleteNotification } from '../hooks/useApi'
import { Clock, CheckCircle, AlertCircle, MessageSquare, Star, Trash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAll = useMarkAllNotifications()
  const remove = useDeleteNotification()

  const getIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Notifications</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-2 text-gray-400">All system and support notifications for your account.</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent notifications</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAll.mutate()}
                className="text-sm text-purple-500 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (notifications || []).length === 0 ? (
              <p className="text-gray-400">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl flex items-start gap-3 ${!n.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-transparent'}`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!n.read ? 'font-medium text-white' : 'text-gray-300'}`}>{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!n.read && (
                      <button onClick={() => markAsRead.mutate(n.id)} className="text-xs text-green-400">Mark read</button>
                    )}
                    <button onClick={() => remove.mutate(n.id)} className="text-xs text-red-400 flex items-center gap-1"><Trash className="w-3 h-3"/>Delete</button>
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
