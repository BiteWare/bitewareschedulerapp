import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Debug: Log the entire process.env to see what's available
console.log('Available environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Failed to load Supabase environment variables:', {
    supabaseUrlLength: supabaseUrl?.length || 0,
    supabaseKeyLength: supabaseAnonKey?.length || 0,
    envLocation: '.env.local'
  })
  throw new Error('Environment variables not loading from .env.local - check Next.js environment configuration')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 