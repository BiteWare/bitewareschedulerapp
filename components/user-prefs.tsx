'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/utils/supabaseclient"
import { useSupabase } from '@/components/supabase-provider'
import { UserProfile, UserSchedule, Database } from "@/types/supabase"
import { ScheduleAvailability } from "@/components/schedule-availability"

interface UserPrefsData {
  profile: Omit<UserProfile, 'id' | 'email' | 'created_at'>;
  schedule: Omit<UserSchedule, 'id' | 'user_id' | 'created_at'>;
}

export default function UserPrefs() {
  const { session } = useSupabase()
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isScheduleLoading, setIsScheduleLoading] = useState(false)
  const [userData, setUserData] = useState<UserPrefsData>({
    profile: {
      name: '',
      role: 'user',
      team: 'unassigned'
    },
    schedule: {
      timezone: 'UTC',
      work_hours_start: '09:00',
      work_hours_end: '17:00',
      standing_meetings: null
    }
  })
  const [scheduleId, setScheduleId] = useState<string>('');

  const loadProfileData = async (userId: string) => {
    console.log('Loading profile data for ID:', userId)
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role, team')
        .eq('id', userId)
        .single()

      console.log('Profile data received:', profile)
      if (profileError) throw profileError

      setUserData(prev => ({
        ...prev,
        profile: {
          name: profile?.name ?? '',
          role: profile?.role ?? 'user',
          team: profile?.team ?? 'unassigned'
        }
      }))
    } catch (error) {
      console.error('Error loading profile data:', error)
      toast.error('Failed to load profile data')
    }
  }

  const loadScheduleData = async (userId: string) => {
    console.log('Loading schedule data for ID:', userId)
    try {
      const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('Raw schedule response:', { data: schedule, error: scheduleError })

      if (!schedule || (scheduleError && scheduleError.code === 'PGRST116')) {
        setUserData(prev => ({
          ...prev,
          schedule: {
            timezone: 'UTC',
            work_hours_start: '09:00',
            work_hours_end: '17:00',
            standing_meetings: null
          }
        }))
        return
      }

      if (scheduleError) throw scheduleError

      setUserData(prev => ({
        ...prev,
        schedule: {
          timezone: schedule.timezone,
          work_hours_start: schedule.work_hours_start,
          work_hours_end: schedule.work_hours_end,
          standing_meetings: schedule.standing_meetings
        }
      }))
    } catch (error) {
      console.error('Detailed error loading schedule data:', error)
      toast.error('Failed to load schedule data')
    }
  }

  useEffect(() => {
    console.log('Session in useEffect:', session)
    if (session?.user.id) {
      loadProfileData(session.user.id)
      loadScheduleData(session.user.id)
    }
  }, [session])

  useEffect(() => {
    const loadSchedule = async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .single();
      
      if (data) {
        setScheduleId(data.id);
        setUserData(prev => ({
          ...prev,
          schedule: {
            timezone: data.timezone,
            work_hours_start: data.work_hours_start,
            work_hours_end: data.work_hours_end,
            standing_meetings: data.standing_meetings
          }
        }));
      }
    };
    
    loadSchedule();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user.id) return

    setIsProfileLoading(true)
    try {
      const updateData: Database['public']['Tables']['users']['Update'] = {
        name: userData.profile.name,
        role: userData.profile.role,
        team: userData.profile.team
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', session.user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`)
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user.id) return

    setIsScheduleLoading(true)
    try {
      const scheduleData = {
        user_id: session.user.id,
        timezone: userData.schedule.timezone,
        work_hours_start: userData.schedule.work_hours_start,
        work_hours_end: userData.schedule.work_hours_end,
        standing_meetings: userData.schedule.standing_meetings
      }

      // Check if schedule exists
      const { data: existingSchedule } = await supabase
        .from('schedules')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (existingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('user_id', session.user.id)

        if (error) throw error
      } else {
        // Insert new schedule
        const { error } = await supabase
          .from('schedules')
          .insert([scheduleData])

        if (error) throw error
      }

      toast.success('Schedule updated successfully!')
    } catch (error: any) {
      console.error('Error updating schedule:', error)
      toast.error(`Failed to update schedule: ${error.message || 'Unknown error'}`)
    } finally {
      setIsScheduleLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Profile & Schedule</h1>
      <div className="flex flex-col gap-4">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your identity and role in the team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    value={userData.profile.name || ''}
                    onChange={(e) => setUserData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="role">Primary Role</Label>
                  <Select 
                    value={userData.profile.role}
                    onValueChange={(value) => setUserData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, role: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="product">Product Manager</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="team">Team</Label>
                  <Select
                    value={userData.profile.team}
                    onValueChange={(value) => setUserData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, team: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardFooter className="flex justify-between mt-4 p-0">
                <Button 
                  type="submit" 
                  disabled={isProfileLoading}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {isProfileLoading ? "Updating..." : "Update Profile"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <ScheduleAvailability
          schedule={userData.schedule}
          scheduleId={scheduleId}
          isLoading={isScheduleLoading}
          onSubmit={handleScheduleSubmit}
          onScheduleChange={(scheduleUpdate) => 
            setUserData(prev => ({
              ...prev,
              schedule: { ...prev.schedule, ...scheduleUpdate }
            }))
          }
        />
      </div>
    </div>
  )
} 