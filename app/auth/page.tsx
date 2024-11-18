"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { supabase } from "@/utils/supabaseclient"
import Image from "next/image"
import Lottie from "lottie-react"
import loadingAnimation from "@/public/zyrisloader.json"
import { UserProfile, UserSchedule } from "@/types/supabase"

interface UserData {
  profile: UserProfile;
  schedule: UserSchedule | null;
}

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          const userData = await loadUserData(session.user.id)
          if (userData) {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
        toast.error('Error verifying session')
      }
    }
    
    checkSession()
  }, [router])

  const loadUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const { data: profile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        if (userError.code === 'PGRST116') {
          return null
        }
        throw userError
      }

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
      console.error('Error in loadUserData:', error)
      throw error
    }
  }

  const createUserProfile = async (userId: string, userEmail: string) => {
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: userEmail,
        role: 'user',
        team: 'unassigned',
        name: null
      }])
      .select()
      .single()

    if (insertError) throw insertError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      if (!data.session) throw new Error('No session data received')

      let userData = await loadUserData(data.session.user.id)
      
      if (!userData) {
        await createUserProfile(data.session.user.id, data.session.user.email!)
        userData = await loadUserData(data.session.user.id)
        
        if (!userData) {
          throw new Error('Failed to create user profile')
        }
      }

      toast.success('Successfully signed in!')
      router.refresh()
      router.push('/')

    } catch (error) {
      console.error('Authentication error:', error)
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Image
              src="/zyris.png"
              alt="Zyris Logo"
              width={150}
              height={150}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <Button
            className="w-1/2 flex items-center justify-center gap-2 mx-auto bg-pink-500 hover:bg-pink-600"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Lottie
                  animationData={loadingAnimation}
                  loop={true}
                  style={{ width: 24, height: 24 }}
                  className="transform rotate-0"
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice'
                  }}
                />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
