import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Gift,
  HelpCircle,
  MessageSquare,
  Star,
  TrendingUp,
  X
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import clsx from 'clsx'

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [hoveredItem, setHoveredItem] = useState(null)
  const isAdmin = user?.role === 'ADMIN'

  const mainLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: '#6366f1' },
    { icon: FolderOpen, label: 'Projects', href: '/projects', color: '#f59e0b' },
    { icon: CheckSquare, label: 'My Tasks', href: '/my-tasks', color: '#10b981' },
    { icon: Calendar, label: 'Calendar', href: '/calendar', color: '#8b5cf6' },
    ...(isAdmin ? [
      { icon: Users, label: 'Team', href: '/team', color: '#ec4899' },
      { icon: BarChart3, label: 'Analytics', href: '/analytics', color: '#06b6d4' }
    ] : [])
  ]

  const bottomLinks = [
    { icon: Settings, label: 'Settings', href: '/settings', color: '#94a3b8' },
    ...(isAdmin ? [
      { icon: MessageSquare, label: 'Messages', href: '/messages', color: '#94a3b8' },
      { icon: HelpCircle, label: 'Help & Support', href: '/support', color: '#94a3b8' }
    ] : [])
  ]

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/')

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={clsx(
        "hidden lg:flex h-screen flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 fixed left-0 top-0 z-40",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Logo Section */}
        <div className={clsx(
          "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800",
          sidebarOpen ? "justify-between" : "justify-center"
        )}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  TaskHub
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="mb-4">
            {sidebarOpen && (
              <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Main Menu
              </p>
            )}
            {mainLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onMouseEnter={() => setHoveredItem(link.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={clsx(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  title={!sidebarOpen ? link.label : ''}
                >
                  <link.icon 
                    className={clsx(
                      "w-5 h-5 transition-all",
                      active ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
                    )} 
                  />
                  {sidebarOpen && (
                    <span className={clsx(
                      "text-sm font-medium",
                      active ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {link.label}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!sidebarOpen && hoveredItem === link.label && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50">
                      {link.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Upgrade Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            {sidebarOpen ? (
              <div className="mx-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Upgrade to Pro
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Get advanced features and priority support
                </p>
                <button className="w-full text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg px-3 py-1.5 hover:shadow-md transition-all">
                  Upgrade Now
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {bottomLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                onMouseEnter={() => setHoveredItem(link.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={clsx(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  active
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                title={!sidebarOpen ? link.label : ''}
              >
                <link.icon className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
                
                {!sidebarOpen && hoveredItem === link.label && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </Link>
            )
          })}

          {/* Admin Panel Link (Conditional) */}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onMouseEnter={() => setHoveredItem('Admin Panel')}
              onMouseLeave={() => setHoveredItem(null)}
              className={clsx(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive('/admin')
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title={!sidebarOpen ? 'Admin Panel' : ''}
            >
              <Shield className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Admin Panel</span>}
              
              {!sidebarOpen && hoveredItem === 'Admin Panel' && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50">
                  Admin Panel
                </div>
              )}
            </Link>
          )}

          {/* Divider */}
          <div className="my-2 h-px bg-gray-200 dark:bg-gray-800"></div>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            onMouseEnter={() => setHoveredItem('Logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            
            {!sidebarOpen && hoveredItem === 'Logout' && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>

          {/* Version Info */}
          {sidebarOpen && (
            <div className="mt-4 px-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">Version 2.0.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
          <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 z-50 shadow-2xl lg:hidden">
            {/* Same content as desktop sidebar */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  TaskHub
                </span>
              </div>
              <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={toggleSidebar}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive(link.href)
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  )
}