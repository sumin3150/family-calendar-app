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
const LOCAL_EVENTS_KEY = 'family-calendar-events';
const LOCAL_TASKS_KEY = 'family-calendar-tasks';

// KVが利用可能かチェック
async function isKVAvailable(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch {
    return false;
  }
}

// LocalStorageヘルパー関数
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage保存エラー:', error);
  }
}

// 初期データ
const initialEvents: Event[] = [
  { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
  { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
  { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
];

const initialTasks: string[] = ["仕事", "サックス", "テニス"];

export async function getEvents(): Promise<Event[]> {
  try {
    const kvAvailable = await isKVAvailable();
    
    if (kvAvailable) {
      console.log('KVからデータを取得中...');
      const events = await kv.get<Event[]>(EVENTS_KEY);
      if (!events) {
        // KVに初期データを設定
        await kv.set(EVENTS_KEY, initialEvents);
        return initialEvents;
      }
      // 削除されたメンバーのイベントをフィルタリング
      const filteredEvents = events.filter(event => 
        event.member === 'けんじ' || event.member === 'あい'
      );
      // LocalStorageにもバックアップ
      setToLocalStorage(LOCAL_EVENTS_KEY, filteredEvents);
      return filteredEvents;
    } else {
      console.log('KV未設定 - LocalStorageからデータを取得中...');
      const localEvents = getFromLocalStorage<Event[]>(LOCAL_EVENTS_KEY, initialEvents);
      const filteredEvents = localEvents.filter(event => 
        event.member === 'けんじ' || event.member === 'あい'
      );
      return filteredEvents;
    }
  } catch (error) {
    console.error('イベント取得エラー:', error);
    // フォールバック: LocalStorageから取得
    const localEvents = getFromLocalStorage<Event[]>(LOCAL_EVENTS_KEY, initialEvents);
    return localEvents.filter(event => 
      event.member === 'けんじ' || event.member === 'あい'
    );
  }
}

export async function getTasks(): Promise<string[]> {
  try {
    const kvAvailable = await isKVAvailable();
    
    if (kvAvailable) {
      console.log('KVからタスクを取得中...');
      const tasks = await kv.get<string[]>(TASKS_KEY);
      if (!tasks) {
        // KVに初期データを設定
        await kv.set(TASKS_KEY, initialTasks);
        return initialTasks;
      }
      // LocalStorageにもバックアップ
      setToLocalStorage(LOCAL_TASKS_KEY, tasks);
      return tasks;
    } else {
      console.log('KV未設定 - LocalStorageからタスクを取得中...');
      return getFromLocalStorage<string[]>(LOCAL_TASKS_KEY, initialTasks);
    }
  } catch (error) {
    console.error('タスク取得エラー:', error);
    // フォールバック: LocalStorageから取得
    return getFromLocalStorage<string[]>(LOCAL_TASKS_KEY, initialTasks);
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
    
    const kvAvailable = await isKVAvailable();
    
    if (kvAvailable) {
      console.log('KVにイベントを保存中...');
      await kv.set(EVENTS_KEY, events);
    } else {
      console.log('KV未設定 - LocalStorageにイベントを保存中...');
    }
    
    // 常にLocalStorageにもバックアップ
    setToLocalStorage(LOCAL_EVENTS_KEY, events);
    
    return event;
  } catch (error) {
    console.error('イベント保存エラー:', error);
    // フォールバック: LocalStorageのみに保存
    const events = await getEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    
    setToLocalStorage(LOCAL_EVENTS_KEY, events);
    return event;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const events = await getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    
    if (filteredEvents.length !== events.length) {
      const kvAvailable = await isKVAvailable();
      
      if (kvAvailable) {
        console.log('KVからイベントを削除中...');
        await kv.set(EVENTS_KEY, filteredEvents);
      } else {
        console.log('KV未設定 - LocalStorageからイベントを削除中...');
      }
      
      // 常にLocalStorageからも削除
      setToLocalStorage(LOCAL_EVENTS_KEY, filteredEvents);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('イベント削除エラー:', error);
    // フォールバック: LocalStorageから削除
    const events = getFromLocalStorage<Event[]>(LOCAL_EVENTS_KEY, []);
    const filteredEvents = events.filter(e => e.id !== eventId);
    setToLocalStorage(LOCAL_EVENTS_KEY, filteredEvents);
    return filteredEvents.length !== events.length;
  }
}

export async function saveTask(task: string): Promise<string> {
  try {
    const tasks = await getTasks();
    
    if (!tasks.includes(task)) {
      tasks.push(task);
      
      const kvAvailable = await isKVAvailable();
      
      if (kvAvailable) {
        console.log('KVにタスクを保存中...');
        await kv.set(TASKS_KEY, tasks);
      } else {
        console.log('KV未設定 - LocalStorageにタスクを保存中...');
      }
      
      // 常にLocalStorageにもバックアップ
      setToLocalStorage(LOCAL_TASKS_KEY, tasks);
    }
    
    return task;
  } catch (error) {
    console.error('タスク保存エラー:', error);
    // フォールバック: LocalStorageに保存
    const tasks = getFromLocalStorage<string[]>(LOCAL_TASKS_KEY, initialTasks);
    if (!tasks.includes(task)) {
      tasks.push(task);
      setToLocalStorage(LOCAL_TASKS_KEY, tasks);
    }
    return task;
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