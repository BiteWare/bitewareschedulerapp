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
import ProjectTasks from './project-tasks'
import ScheduleOptimizer from './schedule-optimizer'
import { TeamSchedule } from './team-schedule'

export default function UserPrefs() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeParentTab, setActiveParentTab] = useState("user-settings")

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
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex space-x-2">
            <Button
              variant={activeParentTab === "user-settings" ? "default" : "outline"}
              onClick={() => setActiveParentTab("user-settings")}
              className="rounded-lg"
            >
              User Settings
            </Button>
            <Button
              variant={activeParentTab === "project-dashboard" ? "default" : "outline"}
              onClick={() => setActiveParentTab("project-dashboard")}
              className="rounded-lg"
            >
              Project Dashboard
            </Button>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-center">
          {activeParentTab === "user-settings" ? "User Settings" : "Project Dashboard"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeParentTab === "user-settings" ? (
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile & Role</TabsTrigger>
              <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration Preferences</TabsTrigger>
            </TabsList>

            {/* Profile & Role Tab */}
            <TabsContent value="profile">
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
                        <Input id="name" placeholder="John Doe" />
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
                        <Input id="team" placeholder="Frontend Team" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="skills">Key Skills</Label>
                        <Textarea 
                          id="skills" 
                          placeholder="React, TypeScript, UI/UX Design..."
                        />
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

            {/* Schedule & Availability Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Availability</CardTitle>
                  <CardDescription>Your working hours and commitments</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, "Schedule updated successfully!")}>
                    <div className="grid w-full items-center gap-6">
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
                          placeholder="Daily standup: Mon-Fri 10:00 AM&#10;Team sync: Wed 2:00 PM"
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <Label>Time Off & Holidays</Label>
                        <Textarea 
                          placeholder="Vacation: Dec 24-31&#10;Public Holiday: Jan 1"
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <Label>Import Calendar</Label>
                        <div className="space-y-4">
                          <Input type="file" accept=".ics,.csv,image/*" />
                          <p className="text-sm text-muted-foreground">
                            Upload your calendar file (.ics, .csv) or a screenshot of your schedule
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardFooter className="flex justify-between mt-6 p-0">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Schedule"}
                      </Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
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
                          placeholder="Morning: 10:00 AM - 12:00 PM&#10;Afternoon: 2:00 PM - 4:00 PM"
                          className="min-h-[100px]"
                        />
                        <p className="text-sm text-muted-foreground">
                          When are you most productive for collaborative work?
                        </p>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <Label>Focus Time Blocks</Label>
                        <Textarea 
                          placeholder="Deep work: Mon/Wed/Fri 8:00 AM - 10:00 AM&#10;No meetings: Tue/Thu afternoons"
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
        ) : (
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="projects" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="projects">Projects Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Task Management</TabsTrigger>
                  <TabsTrigger value="team">Team Schedule</TabsTrigger>
                </TabsList>

                {/* Projects Overview Tab */}
                <TabsContent value="projects">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Projects</CardTitle>
                      <CardDescription>Overview of all ongoing projects and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Project List */}
                        <div className="grid gap-4">
                          {/* Example Project Card - This would be mapped over project data */}
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle>Website Redesign</CardTitle>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">High Priority</span>
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">In Progress</span>
                                </div>
                              </div>
                              <CardDescription>Complete overhaul of company website</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <Label>Timeline</Label>
                                  <div className="text-sm">Oct 1, 2023 - Dec 31, 2023</div>
                                </div>
                                <div>
                                  <Label>Required Participants</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">UI Designer</span>
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Frontend Dev</span>
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Project Manager</span>
                                  </div>
                                </div>
                                <div>
                                  <Label>Optional Participants</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border">Content Writer</span>
                                    <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border">SEO Specialist</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Task Management Tab */}
                <TabsContent value="tasks">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Tasks</CardTitle>
                      <CardDescription>High-level task breakdown and scheduling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Task List */}
                        <div className="grid gap-4">
                          {/* Example Task Group */}
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Planning Phase</CardTitle>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Current Phase</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Individual Task */}
                                <div className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">Requirements Gathering</h4>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">4-6 hours</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-sm">Required Participants</Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Product Manager</span>
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Tech Lead</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Dependencies</Label>
                                      <div className="text-sm text-gray-600">None</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Another Task */}
                                <div className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">Technical Design Review</h4>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">2-3 hours</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-sm">Required Participants</Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Tech Lead</span>
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Senior Developer</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Dependencies</Label>
                                      <div className="text-sm text-gray-600">Requirements Gathering</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Team Schedule Tab */}
                <TabsContent value="team">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Schedule</CardTitle>
                      <CardDescription>Optimized team availability and scheduling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-6">
                        <ScheduleOptimizer />
                        <TeamSchedule />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
} 