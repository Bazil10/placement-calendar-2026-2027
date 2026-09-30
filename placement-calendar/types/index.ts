// ============================================================
// Supabase Database Types — Hand-crafted for placement-calendar
// ============================================================

export type UserRole = 'admin' | 'coordinator'
export type DriveStatus = 'tentative' | 'fixed' | 'cancelled'
export type DriveType = 'Summer Internship' | 'Final Placement' | 'Both' | 'GL'
export type ProcessStage = 'PPT' | 'Aptitude/Coding Test' | 'GD' | 'PI'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Drive {
  id: string
  company_name: string
  drive_type: DriveType
  process_stages: ProcessStage[]
  assigned_date: string          // ISO date string: 'YYYY-MM-DD'
  poc_name: string
  notes: string | null
  status: DriveStatus
  created_by: string             // UUID -> Profile.id
  confirmed_by: string | null    // UUID -> Profile.id
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

// Drive with joined profile data
export interface DriveWithProfiles extends Drive {
  creator?: Pick<Profile, 'id' | 'full_name' | 'email'>
  confirmer?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

// Form data for create/edit modal
export interface DriveFormData {
  company_name: string
  drive_type: DriveType
  process_stages: ProcessStage[]
  assigned_date: string
  poc_name: string
  notes: string
}

// Calendar view modes
export type CalendarView = 'month' | 'week'
export type CalendarTab = 'fixed' | 'tentative' | 'all'

// Day cell data for the calendar grid
export interface DayCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isInRange: boolean   // within Jan 2026 – Jun 2027
  drives: Drive[]
}

// Database type wrapping (mirrors Supabase generated types structure)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      drives: {
        Row: Drive
        Insert: Omit<Drive, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Drive, 'id' | 'created_at'>>
      }
    }
    Functions: {
      is_admin: { Returns: boolean }
      my_role: { Returns: string }
    }
  }
}
