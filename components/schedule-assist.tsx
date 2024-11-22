"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ChevronDown, RefreshCcw, Bot } from 'lucide-react'
import { UserProfile, UserSchedule, Project, Task } from '@/types/supabase'
import { supabase } from '@/utils/supabaseclient'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import Lottie from 'lottie-react';
import assistantLoader from '@/app/assets/annimations/assistantloader.json';

interface ScheduleAssistProps {
  userData: {
    profile: UserProfile | null;
    schedule: UserSchedule | null;
  } | null;
}

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  role?: 'user' | 'assistant' | 'system';
}

export default function ScheduleAssist({ userData }: ScheduleAssistProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load projects and tasks
  useEffect(() => {
    const loadUserData = async () => {
      if (!userData?.profile?.id) return;

      try {
        // Load projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userData.profile.id)
          .order('order', { ascending: true });

        if (projectsError) throw projectsError;
        setProjects(projectsData);

        // Load tasks for all projects
        if (projectsData.length > 0) {
          const projectIds = projectsData.map(p => p.id);
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .in('project_id', projectIds)
            .order('order', { ascending: true });

          if (tasksError) throw tasksError;
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Error loading projects and tasks:', error);
      }
    };

    loadUserData();
  }, [userData?.profile?.id]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMessage: Message = { 
        text: inputMessage, 
        sender: 'user', 
        role: 'user' 
      }
      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.concat([userMessage]).map(msg => ({
              role: msg.role || msg.sender,
              content: msg.text
            }))
          }),
        })

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        setMessages(prev => [...prev, {
          text: data.response.content,
          sender: 'assistant',
          role: 'assistant'
        }])
      } catch (error) {
        console.error('Error:', error)
        setMessages(prev => [...prev, {
          text: "I apologize, but I'm having trouble responding right now. Please try again later.",
          sender: 'assistant',
          role: 'assistant'
        }])
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Add helper function to get pastel color based on hours
  const getHoursColor = (hours: number) => {
    if (hours <= 4) return 'bg-blue-100 text-blue-800'
    if (hours <= 8) return 'bg-green-100 text-green-800'
    if (hours <= 20) return 'bg-yellow-100 text-yellow-800'
    return 'bg-pink-100 text-pink-800'
  }

  const resetChat = () => {
    setMessages([])
    setInputMessage('')
  }

  return (
    <div className="h-full bg-background">
      <div className="grid gap-6 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {userData?.profile?.name?.split(' ').map(n => n[0]).join('') || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userData?.profile?.name || 'Not Available'}</h2>
                <p className="text-muted-foreground">{userData?.profile?.email || 'No email'}</p>
                <Badge>{userData?.profile?.role || 'No role'}</Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Current Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Working Hours: {userData?.schedule?.work_hours_start || 'Not set'} - {userData?.schedule?.work_hours_end || 'Not set'}</p>
                    <p>Timezone: {userData?.schedule?.timezone || 'UTC'}</p>
                    {userData?.schedule?.standing_meetings && (
                      <p>Standing Meetings: {userData.schedule.standing_meetings}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {projects.slice(0, 3).map(project => (
                      <li key={project.id} className="flex justify-between items-center">
                        <span>{project.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className={`${getHoursColor(project.hours)} border-0`}
                          >
                            {project.hours}h/{project.per}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        All Projects <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {projects.map(project => (
                        <DropdownMenuItem key={project.id}>
                          <span className="flex-1">{project.name}</span>
                          <Badge 
                            variant="secondary"
                            className={`${getHoursColor(project.hours)} border-0 ml-2`}
                          >
                            {project.hours}h/{project.per}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="flex justify-between items-center">
                        <span>{task.title}</span>
                        <Badge 
                          variant="secondary"
                          className={`${getHoursColor(task.hours)} border-0`}
                        >
                          {task.hours}h
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        All Tasks <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {tasks.map(task => (
                        <DropdownMenuItem key={task.id}>
                          <span className="flex-1">{task.title}</span>
                          <Badge 
                            variant="secondary"
                            className={`${getHoursColor(task.hours)} border-0 ml-2`}
                          >
                            {task.hours}h
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-col items-center relative pb-2">
            <div className="text-center flex items-center gap-2">
              <Bot className="h-6 w-6 text-pink-600" />
              <CardTitle>Sync</CardTitle>
            </div>
            <CardDescription>Chat with our AI to manage your schedule</CardDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetChat}
              className="h-8 w-8 hover:bg-pink-100 hover:text-pink-800 text-pink-600 absolute right-6 top-6"
              title="Start Over"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Start Over</span>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] md:h-[400px] w-full pr-4 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="w-24 h-24">
                    <Lottie
                      animationData={assistantLoader}
                      loop={true}
                      autoplay={true}
                    />
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex items-center mt-4">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-grow"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                className="ml-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

