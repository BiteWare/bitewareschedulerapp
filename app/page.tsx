'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import MainDashboard from '@/components/main-dashboard'
import { supabase } from '@/utils/supabaseclient'
import { toast } from "sonner"
import { UserProfile, UserSchedule } from '@/types/supabase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<{
    profile: UserProfile | null;
    schedule: UserSchedule | null;
  } | null>(null)

  useEffect(() => {
    const loadUserData = async (userId: string) => {
      try {
        console.log('Loading data for user:', userId);

        const { data: user, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            role,
            team,
            created_at
          `)
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('User error:', userError);
          throw userError;
        }

        console.log('Loaded user:', user);

        const { data: schedule, error: scheduleError } = await supabase
          .from('schedules')
          .select(`
            id,
            user_id,
            start_time,
            end_time,
            recurring,
            created_at
          `)
          .eq('user_id', userId)
          .single();

        console.log('Schedule query result:', { schedule, error: scheduleError });

        if (scheduleError && scheduleError.code !== 'PGRST116') {
          console.error('Schedule error:', scheduleError);
          throw scheduleError;
        }

        setUserData({
          profile: user,
          schedule: schedule || null
        });
      } catch (error) {
        console.error('Detailed error in loadUserData:', error);
        toast.error('Failed to load user data');
      }
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      
      await loadUserData(session.user.id)
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <MainDashboard userData={userData} />
      </main>
    </div>
  )
} 