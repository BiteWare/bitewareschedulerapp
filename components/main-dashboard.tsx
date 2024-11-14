"use client";

import { useState } from "react";
import { User, FolderOpen } from "lucide-react";
import UserPrefs from "./user-prefs";
import { Button } from "./ui/button";
import ProjectTasks from "./project-tasks";
import ScheduleOptimizer from "./schedule-optimizer";
import { TeamSchedule } from "./team-schedule";

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-secondary rounded-lg shadow-lg p-6">
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'users' ? "default" : "outline"}
            onClick={() => setActiveTab('users')}
          >
            <User className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button 
            variant={activeTab === 'projects' ? "default" : "outline"}
            onClick={() => setActiveTab('projects')}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </Button>
        </div>

        <div className="bg-background rounded-lg p-4">
          {activeTab === 'users' ? (
            <UserPrefs />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <TeamSchedule />
              </div>
              <div>
                <ProjectTasks />
              </div>
              <div>
                <ScheduleOptimizer />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 