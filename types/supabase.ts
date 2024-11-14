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
      roles: {
        Row: {
          id: string
          role_name: string
        }
        Insert: {
          id?: string
          role_name: string
        }
        Update: {
          id?: string
          role_name?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: string
          team: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role: string
          team: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: string
          team?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string
          recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time: string
          recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string
          recurring?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  team: string;
  created_at: string;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
  created_at: string;
} 