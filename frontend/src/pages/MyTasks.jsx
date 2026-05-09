import React from 'react'
import Layout from '../components/Layout'

export default function MyTasks() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Tasks</h1>
          <p className="text-text-secondary mt-2">All tasks assigned to you</p>
        </div>
        <div className="text-center py-12 bg-bg-card border border-border rounded-xl">
          <p className="text-text-secondary">My Tasks view coming soon</p>
        </div>
      </div>
    </Layout>
  )
}
