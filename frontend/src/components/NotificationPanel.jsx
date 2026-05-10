import React from 'react'
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotifications } from '../hooks/useApi'
import { Clock, BellOff, CheckCircle, AlertCircle, MessageSquare, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function NotificationPanel() {
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotifications()

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'achievement':
        return <Star className="w-4 h-4 text-yellow-500" />
      default:
        return <BellOff className="w-4 h-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <div className="p-4 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slide-down">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Stay updated with your latest activities
          </p>
        </div>
        {notifications && notifications.length > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={clsx(
                'p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                !notification.read && 'bg-purple-50/50 dark:bg-purple-900/10'
              )}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className={clsx(
                  "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
                  !notification.read ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    "text-sm",
                    !notification.read ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              You're all caught up!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Link
            to="/notifications"
            className="block text-center text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  )
}