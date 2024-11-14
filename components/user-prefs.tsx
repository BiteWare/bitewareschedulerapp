'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabaseclient"
import type { Database } from "@/types/supabase"

interface UserDataState {
  email: string
  name: string
  role: string
  team: string
  schedules: Database['public']['Tables']['schedules']['Row'][]
  workHoursStart: string
  workHoursEnd: string
  timezone: string
  standingMeetings: string
}

export default function UserPrefs() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserDataState>({
    email: '',
    name: '',
    role: '',
    team: '',
    schedules: [],
    workHoursStart: '09:00',
    workHoursEnd: '17:00',
    timezone: 'UTC',
    standingMeetings: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }
      
      if (!user) {
        console.error('No user found')
        return
      }

      // First verify the user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (userError) {
        console.error('User fetch error:', userError)
        // If user doesn't exist in our users table, create them
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id,
              email: user.email,
              role: 'user', // Default role
              team: 'unassigned' // Default team
            }
          ])
        
        if (insertError) {
          console.error('User insert error:', insertError)
          throw insertError
        }
      }

      // Now get the schedules
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)

      if (schedulesError) {
        console.error('Schedules fetch error:', schedulesError)
        throw schedulesError
      }

      setUserData({
        email: user.email || '',
        name: userData?.name || '',
        role: userData?.role || 'user',
        team: userData?.team || 'unassigned',
        schedules: schedules || [],
        workHoursStart: '09:00',
        workHoursEnd: '17:00',
        timezone: 'UTC',
        standingMeetings: ''
      })

    } catch (error) {
      console.error('Detailed error:', error)
      toast({
        title: "Error",
        description: "Could not load user data. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, message: string): Promise<void> => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('No user found')

      // Log the current state for debugging
      console.log('Updating user with data:', {
        id: user.id,
        name: userData.name,
        role: userData.role,
        team: userData.team
      })

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          role: userData.role || 'user',
          team: userData.team || 'unassigned'
        })
        .eq('id', user.id)
        .select()

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      console.log('Update response:', data)

      toast({
        title: "Success",
        description: message,
      })

    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Insert new schedule - directly tied to user only
      await supabase
        .from('schedules')
        .insert({
          user_id: user?.id,
          start_time: userData.workHoursStart,
          end_time: userData.workHoursEnd,
          recurring: true
        })

      toast({
        title: "Success",
        description: "Schedule updated successfully!",
      })

      await loadUserData()

    } catch (error) {
      console.error('Error saving schedule:', error)
      toast({
        title: "Error",
        description: "Failed to save schedule",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Your Settings</h1>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile & Schedule</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration Preferences</TabsTrigger>
        </TabsList>

        {/* Profile & Schedule Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Your identity and role in the team</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Profile updated successfully!")}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="role">Primary Role</Label>
                      <Select 
                        value={userData.role}
                        onValueChange={(value) => setUserData(prev => ({
                          ...prev,
                          role: value
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
                        value={userData.team}
                        onValueChange={(value) => setUserData(prev => ({
                          ...prev,
                          team: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardFooter className="flex justify-between mt-4 p-0">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>

            {/* Schedule Section */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Availability</CardTitle>
                <CardDescription>Your working hours and commitments</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScheduleSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label>Timezone</Label>
                      <Select
                        value={userData.timezone}
                        onValueChange={(value) => setUserData(prev => ({
                          ...prev,
                          timezone: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label>Work Hours Start</Label>
                        <Input 
                          type="time" 
                          value={userData.workHoursStart}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            workHoursStart: e.target.value
                          }))}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label>Work Hours End</Label>
                        <Input 
                          type="time" 
                          value={userData.workHoursEnd}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            workHoursEnd: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label>Standing Meetings</Label>
                      <Textarea 
                        value={userData.standingMeetings}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          standingMeetings: e.target.value
                        }))}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  <CardFooter className="flex justify-between mt-4 p-0">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Schedule"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collaboration Preferences Tab */}
        <TabsContent value="collaboration">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Preferences</CardTitle>
              <CardDescription>Define your optimal collaboration times and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, "Preferences saved successfully!")}>
                <div className="grid w-full items-center gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <Label>Peak Collaboration Hours</Label>
                    <Textarea 
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      When are you most productive for collaborative work?
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Focus Time Blocks</Label>
                    <Textarea 
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      When do you need uninterrupted focus time?
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Communication Preferences</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="async">Prefer Async Communication</SelectItem>
                        <SelectItem value="sync">Prefer Real-time Communication</SelectItem>
                        <SelectItem value="mixed">Mixed Communication Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardFooter className="flex justify-between mt-6 p-0">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 