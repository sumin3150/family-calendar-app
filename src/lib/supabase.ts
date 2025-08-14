import { createClient } from '@supabase/supabase-js'

// 環境変数の取得とログ出力
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

console.log('[Supabase] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
console.log('[Supabase] Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Environment variables not properly set')
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