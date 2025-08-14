import { createClient } from '@supabase/supabase-js'

// 環境変数の型チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {  
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 認証セッションを無効化（今回は認証不使用）
  },
})

// 型定義
export interface Event {
  id: string
  date: string
  time: string
  task: string
  member: string
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: number
  task_name: string
  created_at?: string
}

// データベースの型定義（Supabase自動生成に対応）
export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Event, 'created_at' | 'updated_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
    }
  }
}