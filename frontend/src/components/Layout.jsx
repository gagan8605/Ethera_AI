import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useUIStore } from '../store/uiStore'
import clsx from 'clsx'

export default function Layout({ children }) {
  const { sidebarOpen } = useUIStore()
  const sidebarDesktopWidth = sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className={clsx('flex h-screen overflow-hidden transition-[padding] duration-300', sidebarDesktopWidth)}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}