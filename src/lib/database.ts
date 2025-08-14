import { sql } from '@vercel/postgres';

interface Event {
  id: string;
  date: string;
  time: string;
  task: string;
  member: string;
}

interface DatabaseData {
  events: Event[];
  tasks: string[];
  lastUpdated: string;
}

// データベーステーブルを初期化
async function initializeTables() {
  try {
    // eventsテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        task TEXT NOT NULL,
        member TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // tasksテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        task_name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 削除されたメンバーのイベントをクリーンアップ
    await sql`
      DELETE FROM events 
      WHERE member IN ('しょうま', 'しゅんすけ', 'ゆうか')
    `;

    // 初期データの挿入（データが存在しない場合のみ）
    const existingEvents = await sql`SELECT COUNT(*) as count FROM events`;
    if (existingEvents.rows[0].count === 0) {
      await sql`
        INSERT INTO events (id, date, time, task, member) VALUES 
        ('1', '2025-08-05', '09:00', '仕事', 'けんじ'),
        ('2', '2025-08-06', '18:00', 'サックス', 'あい'),
        ('3', '2025-08-09', '08:00', 'テニス', 'けんじ')
      `;
    }

    const existingTasks = await sql`SELECT COUNT(*) as count FROM tasks`;
    if (existingTasks.rows[0].count === 0) {
      await sql`
        INSERT INTO tasks (task_name) VALUES 
        ('仕事'),
        ('サックス'),
        ('テニス')
        ON CONFLICT (task_name) DO NOTHING
      `;
    }
  } catch (error) {
    console.error('データベース初期化エラー:', error);
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    await initializeTables();
    const result = await sql`
      SELECT id, date, time, task, member 
      FROM events 
      ORDER BY date, time
    `;
    return result.rows as Event[];
  } catch (error) {
    console.error('イベント取得エラー:', error);
    return [];
  }
}

export async function getTasks(): Promise<string[]> {
  try {
    await initializeTables();
    const result = await sql`
      SELECT task_name 
      FROM tasks 
      ORDER BY task_name
    `;
    return result.rows.map(row => row.task_name);
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return ['仕事', 'サックス', 'テニス'];
  }
}

export async function saveEvent(event: Event): Promise<Event> {
  try {
    await initializeTables();
    
    // IDが存在しない場合は新しいIDを生成
    if (!event.id) {
      event.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // UPSERT（存在すれば更新、なければ挿入）
    await sql`
      INSERT INTO events (id, date, time, task, member, updated_at) 
      VALUES (${event.id}, ${event.date}, ${event.time}, ${event.task}, ${event.member}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET 
        date = ${event.date}, 
        time = ${event.time}, 
        task = ${event.task}, 
        member = ${event.member}, 
        updated_at = CURRENT_TIMESTAMP
    `;
    
    return event;
  } catch (error) {
    console.error('イベント保存エラー:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    await initializeTables();
    const result = await sql`
      DELETE FROM events 
      WHERE id = ${eventId}
    `;
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('イベント削除エラー:', error);
    return false;
  }
}

export async function saveTask(task: string): Promise<string> {
  try {
    await initializeTables();
    await sql`
      INSERT INTO tasks (task_name) 
      VALUES (${task}) 
      ON CONFLICT (task_name) DO NOTHING
    `;
    return task;
  } catch (error) {
    console.error('タスク保存エラー:', error);
    throw error;
  }
}

export async function getAllData(): Promise<DatabaseData> {
  try {
    const [events, tasks] = await Promise.all([
      getEvents(),
      getTasks()
    ]);
    
    return {
      events,
      tasks,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('全データ取得エラー:', error);
    return {
      events: [],
      tasks: [],
      lastUpdated: new Date().toISOString()
    };
  }
}