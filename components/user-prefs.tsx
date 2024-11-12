'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function UserPrefs() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, message: string) => {
    event.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Success!",
        description: message,
      })
    }, 1000)
  }

  return (
    <Card className="container mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">Scheduling Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Profile updated successfully!")}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" placeholder="Software Engineer" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us about yourself" />
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
          </TabsContent>
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
                <CardDescription>Set your work hours and time off</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Availability settings saved successfully!")}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="workHoursStart">Work Hours Start</Label>
                      <Input id="workHoursStart" type="time" defaultValue="09:00" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="workHoursEnd">Work Hours End</Label>
                      <Input id="workHoursEnd" type="time" defaultValue="17:00" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="UTC">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select your timezone" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="standingMeetings">Standing Meetings</Label>
                      <Input id="standingMeetings" placeholder="Mon 10:00, Wed 14:00" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="holidays">Holidays</Label>
                      <Input id="holidays" placeholder="2023-12-25, 2024-01-01" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="vacations">Vacations</Label>
                      <Input id="vacations" placeholder="2023-07-01 to 2023-07-15" />
                    </div>
                  </div>
                  <CardFooter className="flex justify-between mt-4 p-0">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Availability"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Preferences</CardTitle>
                <CardDescription>Set your preferred collaboration times</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Collaboration preferences saved successfully!")}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="preferredTimes">Preferred Collaboration Times</Label>
                      <Input id="preferredTimes" placeholder="Mon-Fri 10:00-12:00, 14:00-16:00" />
                    </div>
                  </div>
                  <CardFooter className="flex justify-between mt-4 p-0">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Upload</CardTitle>
                <CardDescription>Upload your existing calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Calendar uploaded successfully!")}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="calendarFile">Upload Calendar File</Label>
                      <Input id="calendarFile" type="file" accept="image/*,.ics,.csv" />
                    </div>
                  </div>
                  <CardFooter className="flex justify-between mt-4 p-0">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Uploading..." : "Upload Calendar"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 