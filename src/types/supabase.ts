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
      app_users: {
        Row: {
          id: string
          auth_id: string
          name: string
          email: string
          role: 'admin' | 'registration' | 'forensics' | 'forensics_head'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          name: string
          email: string
          role: 'admin' | 'registration' | 'forensics' | 'forensics_head'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          name?: string
          email?: string
          role?: 'admin' | 'registration' | 'forensics' | 'forensics_head'
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          title: string
          description: string | null
          status: 'new' | 'in_progress' | 'completed'
          priority: 'normal' | 'urgent'
          department: string
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
          received_date: string | null
          received_time: string | null
          person_name: string | null
          cpr_no: string | null
          passport_no: string | null
          gender: string | null
          nationality: string | null
          sender_name: string | null
          from_dept: string | null
          police_no: string | null
          sender_case_no: string | null
          police_station: string | null
          submitted_by: string | null
          submitter_police_no: string | null
          person_in_charge: string | null
          sample_count: number | null
          sample_receiver: string | null
          expected_finish_date: string | null
          case_entered_by: string | null
        }
        Insert: {
          id?: string
          case_number: string
          title: string
          description?: string | null
          status?: 'new' | 'in_progress' | 'completed'
          priority?: 'normal' | 'urgent'
          department: string
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          received_date?: string | null
          received_time?: string | null
          person_name?: string | null
          cpr_no?: string | null
          passport_no?: string | null
          gender?: string | null
          nationality?: string | null
          sender_name?: string | null
          from_dept?: string | null
          police_no?: string | null
          sender_case_no?: string | null
          police_station?: string | null
          submitted_by?: string | null
          submitter_police_no?: string | null
          person_in_charge?: string | null
          sample_count?: number | null
          sample_receiver?: string | null
          expected_finish_date?: string | null
          case_entered_by?: string | null
        }
        Update: {
          id?: string
          case_number?: string
          title?: string
          description?: string | null
          status?: 'new' | 'in_progress' | 'completed'
          priority?: 'normal' | 'urgent'
          department?: string
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          received_date?: string | null
          received_time?: string | null
          person_name?: string | null
          cpr_no?: string | null
          passport_no?: string | null
          gender?: string | null
          nationality?: string | null
          sender_name?: string | null
          from_dept?: string | null
          police_no?: string | null
          sender_case_no?: string | null
          police_station?: string | null
          submitted_by?: string | null
          submitter_police_no?: string | null
          person_in_charge?: string | null
          sample_count?: number | null
          sample_receiver?: string | null
          expected_finish_date?: string | null
          case_entered_by?: string | null
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