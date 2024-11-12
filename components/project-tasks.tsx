"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Clock } from "lucide-react";
import { useSupabase } from '@/components/supabase-provider';

interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string;
  estimated_time: number;
  priority: string;
}

// Project tasks management component
export default function ProjectTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { supabase } = useSupabase();

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()

      if (error) throw error
      if (data) {
        setTasks([...tasks, data[0]])
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Project Tasks</h2>
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Add Project Task</h3>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input id="task-name" placeholder="Enter task name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-time">Estimated Time</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="estimated-time"
                  type="number"
                  placeholder="Enter hours"
                  min="0"
                />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Project Tasks Overview</h3>
          <div className="rounded-lg border">
            {tasks.length === 0 ? (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                No tasks added yet
              </div>
            ) : (
              <div>{/* Tasks list will go here */}</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}