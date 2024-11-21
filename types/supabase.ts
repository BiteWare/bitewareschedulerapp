export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  team: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  order: number;
  hours: number;
  per: 'Week' | 'Month' | 'Day';
  max_hours: number;
  start_date: Date | null;
  end_date: Date | null;
  created_at: string;
  updated_at: string;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  timezone: string;
  work_hours_start: string | null;
  work_hours_end: string | null;
  standing_meetings: string | null;
  created_at: string;
}

export interface Commitment {
  id: string;
  schedule_id: string;
  type: 'Holidays' | 'Appointments' | 'Meetings';
  flexibility: 'Firm' | 'Flexible';
  title: string | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: string;
  title: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  required_members: string | null;
  optional_members: string | null;
  hours: number;
  order: number;
  recurring: 'Weekdays' | 'M, W, F' | null;
  hour_delay: number;
  next_task: string | null;
  created_at: string;
  updated_at: string;
} 