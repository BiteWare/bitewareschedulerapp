'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import MainDashboard from '@/components/main-dashboard'
import { supabase } from '@/utils/supabaseclient'
import { toast } from "sonner"
import { UserProfile, UserSchedule } from '@/types/supabase'
import Lottie from "lottie-react"
import loadingAnimation from "@/public/zyrisloader.json"
import { useSupabase } from '@/components/supabase-provider'
import { Button } from '@/components/ui/button'

interface UserData {
  profile: UserProfile | null;
  schedule: UserSchedule | null;
}

export default function Home() {
  const router = useRouter()
  const { session } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  const loadUserData = async (userId: string): Promise<UserData> => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Get user schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (scheduleError && scheduleError.code !== 'PGRST116') {
        throw scheduleError
      }

      return {
        profile,
        schedule: schedule || null
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      throw error
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!session) {
          router.push('/auth')
          return
        }

        const data = await loadUserData(session.user.id)
        setUserData(data)
      } catch (error) {
        console.error('Error checking user session:', error)
        toast.error('Failed to load user data')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Set up realtime subscriptions
    const userChannel = supabase.channel('user-updates')

    // Subscribe to user profile changes
    const userSubscription = userChannel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${session?.user.id}`
        }, 
        async (payload) => {
          if (payload.new) {
            setUserData((current) => {
              if (!current) return null;
              return {
                profile: payload.new as UserProfile,
                schedule: current.schedule
              }
            })
            toast.success('Profile updated')
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `user_id=eq.${session?.user.id}`
        },
        async (payload) => {
          if (payload.new) {
            setUserData((current) => {
              if (!current) return null;
              return {
                profile: current.profile,
                schedule: payload.new as UserSchedule
              }
            })
            toast.success('Schedule updated')
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      userChannel.unsubscribe()
    }
  }, [router, session])

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          style={{ width: 50, height: 50 }}
          className="transform rotate-0"
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
        />
      </div>
    )
  }

  // Handle no user data
  if (!userData?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your profile.
          </p>
          <Button
            onClick={() => router.push('/auth')}
            variant="outline"
          >
            Return to Login
          </Button>
        </div>
      </div>
    )
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