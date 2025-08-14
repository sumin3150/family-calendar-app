import { kv } from '@vercel/kv';

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

const EVENTS_KEY = 'family-calendar:events';
const TASKS_KEY = 'family-calendar:tasks';

// 初期データ
const initialEvents: Event[] = [
  { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
  { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
  { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
];

const initialTasks: string[] = ["仕事", "サックス", "テニス"];

export async function getEvents(): Promise<Event[]> {
  try {
    const events = await kv.get<Event[]>(EVENTS_KEY);
    if (!events) {
      // 初期データを設定
      await kv.set(EVENTS_KEY, initialEvents);
      return initialEvents;
    }
    // 削除されたメンバーのイベントをフィルタリング
    const filteredEvents = events.filter(event => 
      event.member === 'けんじ' || event.member === 'あい'
    );
    return filteredEvents;
  } catch (error) {
    console.error('イベント取得エラー:', error);
    return initialEvents;
  }
}

export async function getTasks(): Promise<string[]> {
  try {
    const tasks = await kv.get<string[]>(TASKS_KEY);
    if (!tasks) {
      // 初期データを設定
      await kv.set(TASKS_KEY, initialTasks);
      return initialTasks;
    }
    return tasks;
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return initialTasks;
  }
}

export async function saveEvent(event: Event): Promise<Event> {
  try {
    // IDが存在しない場合は新しいIDを生成
    if (!event.id) {
      event.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const events = await getEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    
    await kv.set(EVENTS_KEY, events);
    return event;
  } catch (error) {
    console.error('イベント保存エラー:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const events = await getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    
    if (filteredEvents.length !== events.length) {
      await kv.set(EVENTS_KEY, filteredEvents);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('イベント削除エラー:', error);
    return false;
  }
}

export async function saveTask(task: string): Promise<string> {
  try {
    const tasks = await getTasks();
    
    if (!tasks.includes(task)) {
      tasks.push(task);
      await kv.set(TASKS_KEY, tasks);
    }
    
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
      events: initialEvents,
      tasks: initialTasks,
      lastUpdated: new Date().toISOString()
    };
  }
}