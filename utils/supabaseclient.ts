import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

export const createServerClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  })
} 