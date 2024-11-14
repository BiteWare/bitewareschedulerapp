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

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    
    checkSession()
  }, [router])

  const loadUserData = async (userId: string) => {
    try {
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
        .single()

      if (userError) {
        throw userError
      }

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
        .single()

      if (scheduleError && scheduleError.code !== 'PGRST116') {
        throw scheduleError
      }

      return { 
        profile: user,
        schedule: schedule || null
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        toast.error(error.message)
        return
      }

      if (data.session) {
        // Check if user exists in users table
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.session.user.id)
          .single()

        if (!existingUser) {
          // Create user record if it doesn't exist
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.session.user.id,
                email: data.session.user.email,
                role: 'user',  // default role
                team: 'unassigned',  // default team
                password_hash: '' // we don't store the actual password hash
              }
            ])

          if (insertError) {
            console.error('Error creating user record:', insertError)
            toast.error('Error setting up user account')
            return
          }
        }

        // Now load the user data
        const userData = await loadUserData(data.session.user.id)
        if (userData) {
          toast.success('Successfully signed in!')
          router.refresh()
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Detailed auth error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
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
            <Label htmlFor="email">
              Email
            </Label>
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
            <Label htmlFor="password">
              Password
            </Label>
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
            className="w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
