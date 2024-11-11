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
      tasks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          assignee: string | null
          estimated_time: number | null
          priority: 'low' | 'medium' | 'high'
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          assignee?: string | null
          estimated_time?: number | null
          priority?: 'low' | 'medium' | 'high'
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          assignee?: string | null
          estimated_time?: number | null
          priority?: 'low' | 'medium' | 'high'
        }
      }
      // Add other tables as needed
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