"use client";

import { useSupabase } from '@/components/supabase-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ProjectTasks from './project-tasks'

const ProjectDashboard: React.FC = () => {
  const { user, isLoading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Project Dashboard</h1>
      <ProjectTasks />
    </div>
  )
}

export default ProjectDashboard