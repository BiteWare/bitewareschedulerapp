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
      schedules: {
        Row: UserSchedule;
        Insert: Omit<UserSchedule, 'id' | 'created_at'>;
        Update: Partial<Omit<UserSchedule, 'id' | 'created_at'>>;
      };
      commitments: {
        Row: Commitment;
        Insert: Omit<Commitment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Commitment, 'id' | 'created_at' | 'updated_at'>>;
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
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
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
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
} 