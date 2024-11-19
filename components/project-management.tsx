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

interface Project {
  id: number;
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  hours: number;
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
}

interface TeamMember {
  name: string;
  email: string;
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
    hours: 1
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
    hours: 1
  })
  const [selectedProject, setSelectedProject] = useState<string>('')

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
        setNewProject({ name: "", description: "", priority: "Medium", hours: 1 })
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
        hours: projectToEdit.hours
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
    setNewProject({ name: "", description: "", priority: "Medium", hours: 1 })
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
          hours: 1
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
        hours: taskToEdit.hours
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
      hours: 1
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
      hours: 1
    })
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
            <div>
              <Label>Hours Needed</Label>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Input
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      />
                    ) : project.name}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Input
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      />
                    ) : project.description}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
                      <Select
                        value={newProject.priority}
                        onValueChange={(value) => setNewProject({...newProject, priority: value as 'Low' | 'Medium' | 'High'})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`px-2 py-1 rounded-md ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project.id ? (
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
                    ) : (
                      <span className={`px-2 py-1 rounded-md ${getHoursColor(project.hours)}`}>
                        {project.hours} hrs
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingProjectId === project.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveProjectEdit(project.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingProjectId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditProject(project.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !newTask.startDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.startDate ? format(newTask.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.startDate || undefined}
                    onSelect={(date) => setNewTask({...newTask, startDate: date || null})}
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
                      !newTask.endDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.endDate ? format(newTask.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.endDate || undefined}
                    onSelect={(date) => setNewTask({...newTask, endDate: date || null})}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
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
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Required Members</TableHead>
                <TableHead>Optional Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
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
                  <TableCell>
                    {task.startDate ? format(task.startDate, "PPP") : "Not set"}
                  </TableCell>
                  <TableCell>
                    {task.endDate ? format(task.endDate, "PPP") : "Not set"}
                  </TableCell>
                  <TableCell>{task.requiredMembers}</TableCell>
                  <TableCell>{task.optionalMembers}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === task.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveEdit(task.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditTask(task.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
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
    </div>
  )
}

export default ProjectManagement