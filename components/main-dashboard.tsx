"use client";

import { useState } from "react";
import { User, FolderOpen } from "lucide-react";
import UserPrefs from "./user-prefs";
import ProjectManagement from "./project-management";
import { Button } from "./ui/button";
import { UserProfile, UserSchedule } from '@/types/supabase'

interface MainDashboardProps {
  userData: {
    profile: UserProfile | null;
    schedule: UserSchedule | null;
  } | null;
}

export default function MainDashboard({ userData }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-secondary rounded-lg shadow-lg p-6 min-h-[800px]">
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'users' ? "default" : "outline"}
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}
          >
            <User className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button 
            variant={activeTab === 'projects' ? "default" : "outline"}
            onClick={() => setActiveTab('projects')}
            className={activeTab === 'projects' ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </Button>
        </div>

        <div className="bg-background rounded-lg p-4">
          {activeTab === 'users' ? (
            <UserPrefs />
          ) : (
            <ProjectManagement />
          )}
        </div>
      </div>
    </div>
  );
} 