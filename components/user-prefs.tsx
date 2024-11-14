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
  role_id: string
  schedules: Database['public']['Tables']['schedules']['Row'][]
  roles: {
    id: string
    role_name: string
  }[] | null
}

export default function UserPrefs() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserDataState>({
    email: '',
    role_id: '',
    schedules: [],
    roles: null
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          email,
          role_id,
          roles (
            id,
            role_name
          )
        `)
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)

      if (schedulesError) throw schedulesError

      const rolesArray = Array.isArray(userData.roles) ? userData.roles : [userData.roles].filter(Boolean)

      setUserData({
        email: userData.email,
        role_id: userData.role_id,
        roles: rolesArray,
        schedules: schedules || []
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "Error",
        description: "Failed to load user data",
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, message: string) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Update user data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: userData.email,
          role_id: userData.role_id,
          // Note: password_hash should be handled separately through auth functions
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast({
        title: "Success!",
        description: message,
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user data",
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
                      <Input id="name" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="role">Primary Role</Label>
                      <Select>
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
                      <Select>
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
                <form onSubmit={(e) => handleSubmit(e, "Schedule updated successfully!")}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label>Timezone</Label>
                      <Select defaultValue="UTC">
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
                        <Input type="time" defaultValue="09:00" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label>Work Hours End</Label>
                        <Input type="time" defaultValue="17:00" />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label>Standing Meetings</Label>
                      <Textarea 
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