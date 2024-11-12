"use client";

import { useSupabase } from '@/components/supabase-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ProjectTasks from './project-tasks'
import ScheduleOptimizer from './schedule-optimizer'
import { TeamSchedule } from './team-schedule'
import { Card } from '@/components/ui/card'

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
      <Card className="border-2 shadow-lg">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-2xl font-bold">Project Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              Welcome back, {user.email}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ProjectTasks />
            </div>
            <div className="space-y-6">
              <ScheduleOptimizer />
              <TeamSchedule />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProjectDashboard