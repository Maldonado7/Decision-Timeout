import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Decision = {
  id: string
  user_id: string
  question: string
  pros: string[]
  cons: string[]
  result: 'YES' | 'NO'
  created_at: string
  locked_until: string
  outcome: 'good' | 'bad' | 'pending'
  time_saved: number
  confidence_level?: number
}