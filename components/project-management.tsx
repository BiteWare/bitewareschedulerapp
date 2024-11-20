'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Plus, Pencil, Trash, X, Check, ChevronDown } from 'lucide-react'
import { format } from "date-fns"
import { useSupabase } from '@/components/supabase-provider'
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Folder } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { SelectSingleEventHandler } from "react-day-picker"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

interface Project {
  id: number;
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  hours: number;
  per: 'Week' | 'Month' | 'Day';
  maxHours: number;
  startDate: Date | null;
  endDate: Date | null;
}

interface Task {
  id: number;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  requiredMembers: string;
  optionalMembers: string;
  priority: 'Low' | 'Medium' | 'High';
  hours: number;
  order: number;
  recurring: string[] | null;
  hourDelay: number;
}

interface TeamMember {
  name: string;
  email: string;
}

interface TaskDetails extends Task {
  projectName?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Rodrigo Kammer", email: "rkammer@zyris.com" },
  { name: "Adam Ontiveros", email: "aontiveros@Zyris.com" },
  { name: "Kelly Fuller", email: "kfuller@zyris.com" },
  { name: "Paula Mann", email: "pmann@zyris.com" },
  { name: "Christina Stowell", email: "cstowell@zyris.com" },
  { name: "Sandi Hirsch", email: "SHirsch@Zyris.com" },
  { name: "Shaun Valentine", email: "svalentine@Zyris.com" },
  { name: "John Horton", email: "john@biteware.dev" },
  { name: "Jack Horton", email: "jack@biteware.dev" },
  { name: "Tim Hirsch", email: "tim@biteware.dev" },
]

const getPriorityColor = (priority: 'Low' | 'Medium' | 'High') => {
  switch (priority) {
    case 'Low':
      return 'bg-green-100'
    case 'Medium':
      return 'bg-yellow-100'
    case 'High':
      return 'bg-red-100'
    default:
      return ''
  }
}

const getHoursColor = (hours: number) => {
  if (hours <= 8) {
    return 'bg-blue-100'
  } else if (hours <= 24) {
    return 'bg-purple-100'
  } else {
    return 'bg-pink-100'
  }
}

export function ProjectManagement() {
  const { supabase } = useSupabase()
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: "",
    description: "",
    priority: "Medium",
    hours: 1,
    per: "Week",
    maxHours: 40,
    startDate: null,
    endDate: null
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: "",
    startDate: null,
    endDate: null,
    description: "",
    requiredMembers: "",
    optionalMembers: "",
    priority: "Medium",
    hours: 1,
    order: 1,
    recurring: null,
    hourDelay: 8,
  })
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const handleAddProject = async () => {
    if (newProject.name) {
      try {
        const { data: projectData, error } = await supabase
          .from('projects')
          .insert({
            name: newProject.name,
            description: newProject.description,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single()

        if (error) throw error

        const projectWithId: Project = {
          ...newProject,
          id: projectData.id,
        }
        setProjects([...projects, projectWithId])
        setNewProject({ name: "", description: "", priority: "Medium", hours: 1, per: "Week", maxHours: 40, startDate: null, endDate: null })
        toast.success('Project added successfully')
      } catch (error) {
        console.error('Error adding project:', error)
        toast.error('Failed to add project')
      }
    }
  }

  const handleEditProject = (id: number) => {
    const projectToEdit = projects.find(p => p.id === id)
    if (projectToEdit) {
      setNewProject({
        name: projectToEdit.name,
        description: projectToEdit.description,
        priority: projectToEdit.priority,
        hours: projectToEdit.hours,
        per: projectToEdit.per,
        maxHours: projectToEdit.maxHours,
        startDate: projectToEdit.startDate,
        endDate: projectToEdit.endDate
      })
      setEditingProjectId(id)
    }
  }

  const handleSaveProjectEdit = (id: number) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...newProject, id }
        : project
    ))
    setEditingProjectId(null)
    setNewProject({ name: "", description: "", priority: "Medium", hours: 1, per: "Week", maxHours: 40, startDate: null, endDate: null })
  }

  const handleDeleteProject = async (id: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProjects(prev => prev.filter(project => project.id !== id))
      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleAddTask = async () => {
    if (newTask.title && selectedProject) {
      try {
        const { data: taskData, error } = await supabase
          .from('tasks')
          .insert({
            title: newTask.title,
            description: newTask.description,
            start_date: newTask.startDate?.toISOString(),
            end_date: newTask.endDate?.toISOString(),
            required_members: newTask.requiredMembers,
            optional_members: newTask.optionalMembers,
            priority: newTask.priority,
            hours: newTask.hours,
            project_id: selectedProject
          })
          .select()
          .single()

        if (error) throw error

        const taskWithId: Task = {
          ...newTask,
          id: taskData.id,
        }
        setTasks([...tasks, taskWithId])
        setNewTask({
          title: "",
          startDate: null,
          endDate: null,
          description: "",
          requiredMembers: "",
          optionalMembers: "",
          priority: "Medium",
          hours: 1,
          order: 1,
          recurring: null,
          hourDelay: 8,
        })
        toast.success('Task added successfully')
      } catch (error) {
        console.error('Error adding task:', error)
        toast.error('Failed to add task')
      }
    } else {
      toast.error('Please select a project and enter a task title')
    }
  }

  const handleEditTask = (id: number) => {
    const taskToEdit = tasks.find(t => t.id === id)
    if (taskToEdit) {
      setNewTask({
        title: taskToEdit.title,
        startDate: taskToEdit.startDate,
        endDate: taskToEdit.endDate,
        description: taskToEdit.description,
        requiredMembers: taskToEdit.requiredMembers,
        optionalMembers: taskToEdit.optionalMembers,
        priority: taskToEdit.priority,
        hours: taskToEdit.hours,
        order: taskToEdit.order,
        recurring: taskToEdit.recurring,
        hourDelay: taskToEdit.hourDelay,
      })
      setEditingId(id)
    }
  }

  const handleSaveEdit = (id: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...newTask, id }
        : task
    ))
    setEditingId(null)
    setNewTask({
      title: "",
      startDate: null,
      endDate: null,
      description: "",
      requiredMembers: "",
      optionalMembers: "",
      priority: "Medium",
      hours: 1,
      order: 1,
      recurring: null,
      hourDelay: 8,
    })
  }

  const handleDeleteTask = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewTask({
      title: "",
      startDate: null,
      endDate: null,
      description: "",
      requiredMembers: "",
      optionalMembers: "",
      priority: "Medium",
      hours: 1,
      order: 1,
      recurring: null,
      hourDelay: 8,
    })
  }

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    const projectName = projects.find(p => p.id.toString() === selectedProject)?.name
    setSelectedTask({ ...task, projectName })
    setIsTaskDialogOpen(true)
  }

  useEffect(() => {
    const loadProjectsAndTasks = async () => {
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
        
        if (projectsError) throw projectsError
        
        setProjects(projectsData)

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
        
        if (tasksError) throw tasksError
        
        setTasks(tasksData)
      } catch (error) {
        console.error('Error loading projects and tasks:', error)
        toast.error('Failed to load projects and tasks')
      }
    }

    loadProjectsAndTasks()
  }, [supabase])

  return (
    <div className="h-full">
      <div className="space-y-6">
        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Project Name</Label>
              <Input
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Project description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={newProject.priority}
                onValueChange={(value) => setNewProject({...newProject, priority: value as 'Low' | 'Medium' | 'High'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={newProject.hours}
                  onChange={(e) => {
                    const hours = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 40)
                    setNewProject({...newProject, hours})
                  }}
                />
              </div>
              <div className="flex-1">
                <Label>Per</Label>
                <Select
                  value={newProject.per}
                  onValueChange={(value) => setNewProject({...newProject, per: value as 'Week' | 'Month' | 'Day'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Week">Week</SelectItem>
                    <SelectItem value="Month">Month</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Max Hours</Label>
              <Input
                type="number"
                min={1}
                max={40}
                value={newProject.maxHours}
                onChange={(e) => {
                  const maxHours = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 40)
                  setNewProject({...newProject, maxHours})
                }}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !newProject.startDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newProject.startDate ? format(newProject.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newProject.startDate || undefined}
                    onSelect={(date: Date | undefined) => setNewProject({...newProject, startDate: date || null})}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !newProject.endDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newProject.endDate ? format(newProject.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newProject.endDate || undefined}
                    onSelect={(date: Date | undefined) => setNewProject({...newProject, endDate: date || null})}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={handleAddProject}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Per</TableHead>
                <TableHead>Max Hours</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{editingProjectId === project.id ? (
                    <Input value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                  ) : project.name}</TableCell>
                  <TableCell>{editingProjectId === project.id ? (
                    <Input value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                  ) : project.description}</TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Select value={newProject.priority} onValueChange={(value) => setNewProject({...newProject, priority: value as 'Low' | 'Medium' | 'High'})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`px-2 py-1 rounded-md ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Input type="number" min={1} max={40} value={newProject.hours}
                        onChange={(e) => {
                          const hours = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 40)
                          setNewProject({...newProject, hours})
                        }}
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-md ${getHoursColor(project.hours)}`}>{project.hours} hrs</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Select value={newProject.per} onValueChange={(value) => setNewProject({...newProject, per: value as 'Week' | 'Month' | 'Day'})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Week">Week</SelectItem>
                          <SelectItem value="Month">Month</SelectItem>
                          <SelectItem value="Day">Day</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : project.per}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Input type="number" min={1} max={40} value={newProject.maxHours}
                        onChange={(e) => {
                          const maxHours = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 40)
                          setNewProject({...newProject, maxHours})
                        }}
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-md ${getHoursColor(project.maxHours)}`}>{project.maxHours} hrs</span>
                    )}
                  </TableCell>
                  <TableCell>{project.startDate ? format(project.startDate, "PPP") : "Not set"}</TableCell>
                  <TableCell className="flex items-center justify-between">
                    <span>{project.endDate ? format(project.endDate, "PPP") : "Not set"}</span>
                    <div className="flex items-center gap-2 ml-4">
                      {editingProjectId === project.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveProjectEdit(project.id)}><Check className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingProjectId(null)}><X className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditProject(project.id)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}><Trash className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Existing Tasks Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tasks</h2>
          </div>

          <div>
            <Label>Project</Label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    <span className="flex items-center gap-2">
                      {project.name}
                      <span className={`px-2 py-1 rounded-md text-sm ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-sm ${getHoursColor(project.hours)}`}>
                        {project.hours} hrs
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                min={1}
                value={newTask.order}
                onChange={(e) => setNewTask({...newTask, order: parseInt(e.target.value) || 1})}
              />
            </div>
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Recurring Days</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !newTask.recurring?.length && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.recurring?.length 
                      ? `${newTask.recurring.length} days selected` 
                      : "Select days"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={newTask.recurring?.map(day => new Date(day)) || []}
                    onSelect={(dates: Date[] | undefined) => 
                      setNewTask({
                        ...newTask, 
                        recurring: dates?.map(date => date.toISOString().split('T')[0]) || null
                      })
                    }
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Hour Delay till Next Task</Label>
              <Input
                type="number"
                min={0}
                value={newTask.hourDelay}
                onChange={(e) => setNewTask({...newTask, hourDelay: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Enter task description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({...newTask, priority: value as 'Low' | 'Medium' | 'High'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hours Needed</Label>
              <Input
                type="number"
                min={1}
                max={40}
                value={newTask.hours}
                onChange={(e) => {
                  const hours = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 40)
                  setNewTask({...newTask, hours})
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Required Team Members</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-auto p-2 h-auto">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        {TEAM_MEMBERS.map((member) => (
                          <CommandItem
                            key={member.email}
                            onSelect={() => {
                              setNewTask({
                                ...newTask,
                                requiredMembers: newTask.requiredMembers
                                  ? `${newTask.requiredMembers}, ${member.email}`
                                  : member.email
                              })
                            }}
                          >
                            <span>{member.name}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({member.email})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                placeholder="Select members..."
                value={newTask.requiredMembers}
                onChange={(e) => setNewTask({...newTask, requiredMembers: e.target.value})}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Optional Team Members</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-auto p-2 h-auto">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        {TEAM_MEMBERS.map((member) => (
                          <CommandItem
                            key={member.email}
                            onSelect={() => {
                              setNewTask({
                                ...newTask,
                                optionalMembers: newTask.optionalMembers
                                  ? `${newTask.optionalMembers}, ${member.email}`
                                  : member.email
                              })
                            }}
                          >
                            <span>{member.name}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({member.email})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                placeholder="Select members..."
                value={newTask.optionalMembers}
                onChange={(e) => setNewTask({...newTask, optionalMembers: e.target.value})}
              />
            </div>
          </div>

          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Hour Delay</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Required Members</TableHead>
                <TableHead>Optional Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={(e) => handleTaskClick(e, task)}
                >
                  <TableCell>{task.order}</TableCell>
                  <TableCell>
                    {editingId === task.id ? (
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      />
                    ) : task.title}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md ${getHoursColor(task.hours)}`}>
                      {task.hours} hrs
                    </span>
                  </TableCell>
                  <TableCell>{task.hourDelay}</TableCell>
                  <TableCell>
                    {task.startDate ? format(task.startDate, "PPP") : "Not set"}
                  </TableCell>
                  <TableCell>
                    {task.endDate ? format(task.endDate, "PPP") : "Not set"}
                  </TableCell>
                  <TableCell>{task.recurring || "None"}</TableCell>
                  <TableCell>{task.requiredMembers}</TableCell>
                  <TableCell>{task.optionalMembers}</TableCell>
                  <TableCell className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {editingId === task.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveEdit(task.id)}><Check className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditTask(task.id)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)}><Trash className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <AlertDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex justify-between items-center">
              <span>{selectedTask?.title}</span>
              <span className={`px-2 py-1 rounded-md text-sm ${selectedTask?.priority ? getPriorityColor(selectedTask.priority) : ''}`}>
                {selectedTask?.priority}
              </span>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            {selectedTask?.projectName && (
              <div>
                <span className="font-semibold">Project: </span>
                {selectedTask.projectName}
              </div>
            )}
            <div>
              <span className="font-semibold">Description: </span>
              {selectedTask?.description || 'No description'}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Hours: </span>
                <span className={`px-2 py-1 rounded-md ${selectedTask?.hours ? getHoursColor(selectedTask.hours) : ''}`}>
                  {selectedTask?.hours} hrs
                </span>
              </div>
              <div>
                <span className="font-semibold">Hour Delay: </span>
                {selectedTask?.hourDelay} hrs
              </div>
              <div>
                <span className="font-semibold">Start Date: </span>
                {selectedTask?.startDate ? format(selectedTask.startDate, "PPP") : "Not set"}
              </div>
              <div>
                <span className="font-semibold">End Date: </span>
                {selectedTask?.endDate ? format(selectedTask.endDate, "PPP") : "Not set"}
              </div>
            </div>
            <div>
              <span className="font-semibold">Required Members: </span>
              {selectedTask?.requiredMembers || 'None'}
            </div>
            <div>
              <span className="font-semibold">Optional Members: </span>
              {selectedTask?.optionalMembers || 'None'}
            </div>
            <div>
              <span className="font-semibold">Recurring: </span>
              {selectedTask?.recurring ? selectedTask.recurring.join(', ') : 'None'}
            </div>
            <div>
              <span className="font-semibold">Order: </span>
              {selectedTask?.order}
            </div>
          </div>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProjectManagement