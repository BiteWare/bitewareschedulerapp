"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSchedule } from "@/components/team-schedule";
import { ProjectTasks } from "@/components/project-tasks";
import { ScheduleOptimizer } from "@/components/schedule-optimizer";

export function ProjectDashboard() {
  const [activeTab, setActiveTab] = useState("team");

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Project Scheduling</h1>
        <p className="text-muted-foreground">
          Coordinate your team's schedule and optimize project timelines with AI assistance.
        </p>
      </div>

      <Tabs defaultValue="team" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Team Schedule</TabsTrigger>
          <TabsTrigger value="tasks">Project Tasks</TabsTrigger>
          <TabsTrigger value="optimize">Optimize Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <TeamSchedule />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ProjectTasks />
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <ScheduleOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}