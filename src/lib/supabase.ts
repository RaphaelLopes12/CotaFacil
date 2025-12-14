import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jbuntbeczniriutybbfb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW50YmVjem5pcml1dHliYmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjEyOTgsImV4cCI6MjA4MDI5NzI5OH0.fnAeEHHIaXL_lwjQSZcGrdajemBE2osjOZt7uIM0MN4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
