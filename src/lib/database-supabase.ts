import { supabase, type Event, type Task } from './supabase'

// ログ用のヘルパー関数
const log = (message: string, data?: any) => {
  console.log(`[SupabaseDB] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

const logError = (message: string, error: any) => {
  console.error(`[SupabaseDB ERROR] ${message}:`, error)
}

// =====================================================
// Events（イベント）関連の操作
// =====================================================

export async function getEvents(): Promise<Event[]> {
  try {
    log('イベント一覧を取得開始')
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      logError('イベント取得エラー', error)
      throw new Error(`イベント取得に失敗: ${error.message}`)
    }

    log(`イベント取得成功: ${data?.length || 0}件`)
    return data || []
  } catch (error) {
    logError('getEvents実行エラー', error)
    throw error
  }
}

export async function saveEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Event> {
  try {
    log('イベント保存開始', event)
    
    // IDが存在する場合は更新、存在しない場合は新規作成
    if (event.id) {
      // 既存イベントの更新
      const { data, error } = await supabase
        .from('events')
        .update({
          date: event.date,
          time: event.time,
          task: event.task,
          member: event.member
        })
        .eq('id', event.id)
        .select()
        .single()

      if (error) {
        logError('イベント更新エラー', error)
        throw new Error(`イベント更新に失敗: ${error.message}`)
      }

      log('イベント更新成功', data)
      return data
    } else {
      // 新規イベントの作成
      const { data, error } = await supabase
        .from('events')
        .insert({
          date: event.date,
          time: event.time,
          task: event.task,
          member: event.member
        })
        .select()
        .single()

      if (error) {
        logError('イベント作成エラー', error)
        throw new Error(`イベント作成に失敗: ${error.message}`)
      }

      log('イベント作成成功', data)
      return data
    }
  } catch (error) {
    logError('saveEvent実行エラー', error)
    throw error
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    log(`イベント削除開始: ID=${eventId}`)
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      logError('イベント削除エラー', error)
      throw new Error(`イベント削除に失敗: ${error.message}`)
    }

    log(`イベント削除成功: ID=${eventId}`)
    return true
  } catch (error) {
    logError('deleteEvent実行エラー', error)
    return false
  }
}

// =====================================================
// Tasks（タスク）関連の操作
// =====================================================

export async function getTasks(): Promise<string[]> {
  try {
    log('タスク一覧を取得開始')
    
    const { data, error } = await supabase
      .from('tasks')
      .select('task_name')
      .order('task_name', { ascending: true })

    if (error) {
      logError('タスク取得エラー', error)
      throw new Error(`タスク取得に失敗: ${error.message}`)
    }

    const taskNames = data?.map(item => item.task_name) || []
    log(`タスク取得成功: ${taskNames.length}件`)
    return taskNames
  } catch (error) {
    logError('getTasks実行エラー', error)
    throw error
  }
}

export async function saveTask(taskName: string): Promise<string> {
  try {
    log(`タスク保存開始: ${taskName}`)
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ task_name: taskName })
      .select()
      .single()

    if (error) {
      // UNIQUE制約違反の場合（既に存在する場合）
      if (error.code === '23505') {
        log(`タスク「${taskName}」は既に存在`)
        return taskName
      }
      
      logError('タスク保存エラー', error)
      throw new Error(`タスク保存に失敗: ${error.message}`)
    }

    log('タスク保存成功', data)
    return data.task_name
  } catch (error) {
    logError('saveTask実行エラー', error)
    throw error
  }
}

export async function deleteTask(taskName: string): Promise<boolean> {
  try {
    log(`タスク削除開始: ${taskName}`)
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('task_name', taskName)

    if (error) {
      logError('タスク削除エラー', error)
      throw new Error(`タスク削除に失敗: ${error.message}`)
    }

    log(`タスク削除成功: ${taskName}`)
    return true
  } catch (error) {
    logError('deleteTask実行エラー', error)
    return false
  }
}

// =====================================================
// 統計・分析関数
// =====================================================

// 今月のイベント数を取得
export async function getCurrentMonthEventCount(): Promise<number> {
  try {
    log('今月のイベント数取得開始')
    
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    
    const { data, error } = await supabase
      .from('events')
      .select('id', { count: 'exact' })
      .gte('date', `${currentMonth}-01`)
      .lt('date', `${currentMonth}-32`) // 次月の1日よりも前

    if (error) {
      logError('今月のイベント数取得エラー', error)
      return 0
    }

    log(`今月のイベント数: ${data?.length || 0}件`)
    return data?.length || 0
  } catch (error) {
    logError('getCurrentMonthEventCount実行エラー', error)
    return 0
  }
}

// メンバー別イベント数を取得
export async function getEventCountByMember(): Promise<Record<string, number>> {
  try {
    log('メンバー別イベント数取得開始')
    
    const { data, error } = await supabase
      .from('events')
      .select('member')

    if (error) {
      logError('メンバー別イベント数取得エラー', error)
      return {}
    }

    const counts: Record<string, number> = {}
    data?.forEach(item => {
      counts[item.member] = (counts[item.member] || 0) + 1
    })

    log('メンバー別イベント数取得成功', counts)
    return counts
  } catch (error) {
    logError('getEventCountByMember実行エラー', error)
    return {}
  }
}

// 指定期間のイベントを取得
export async function getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
  try {
    log(`期間指定イベント取得開始: ${startDate} - ${endDate}`)
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      logError('期間指定イベント取得エラー', error)
      throw new Error(`期間指定イベント取得に失敗: ${error.message}`)
    }

    log(`期間指定イベント取得成功: ${data?.length || 0}件`)
    return data || []
  } catch (error) {
    logError('getEventsByDateRange実行エラー', error)
    throw error
  }
}

// =====================================================
// データベース接続テスト
// =====================================================

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    log('データベース接続テスト開始')
    
    // 簡単なクエリでテスト
    const { data, error } = await supabase
      .from('tasks')
      .select('count(*)')
      .limit(1)

    if (error) {
      logError('データベース接続テストエラー', error)
      return false
    }

    log('データベース接続テスト成功')
    return true
  } catch (error) {
    logError('testDatabaseConnection実行エラー', error)
    return false
  }
}

// =====================================================
// データ全体取得（デバッグ用）
// =====================================================

export async function getAllData() {
  try {
    log('全データ取得開始')
    
    const [events, tasks] = await Promise.all([
      getEvents(),
      getTasks()
    ])

    const result = {
      events,
      tasks,
      lastUpdated: new Date().toISOString()
    }

    log('全データ取得成功')
    return result
  } catch (error) {
    logError('getAllData実行エラー', error)
    throw error
  }
}