interface Event {
  id: string;
  date: string;
  time: string;
  task: string;
  member: string;
}

const EVENTS_KEY = 'family-calendar-events';
const TASKS_KEY = 'family-calendar-tasks';

// 初期データ
const initialEvents: Event[] = [
  { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
  { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
  { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
];

const initialTasks: string[] = ["仕事", "サックス", "テニス"];

// LocalStorageヘルパー関数
function safeGetFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') {
      console.log(`[${key}] サーバーサイド - デフォルト値を返す`);
      return defaultValue;
    }
    
    const item = localStorage.getItem(key);
    if (item === null) {
      console.log(`[${key}] データなし - デフォルト値を返す`);
      return defaultValue;
    }
    
    const parsed = JSON.parse(item);
    console.log(`[${key}] データ読み込み成功:`, parsed);
    return parsed;
  } catch (error) {
    console.error(`[${key}] 読み込みエラー:`, error);
    return defaultValue;
  }
}

function safeSetToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') {
      console.log(`[${key}] サーバーサイド - 保存スキップ`);
      return;
    }
    
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`[${key}] 保存成功:`, value);
  } catch (error) {
    console.error(`[${key}] 保存エラー:`, error);
  }
}

// =====================================================
// Events関数
// =====================================================

export async function getEvents(): Promise<Event[]> {
  console.log('getEvents: 開始');
  const events = safeGetFromLocalStorage<Event[]>(EVENTS_KEY, initialEvents);
  
  // 削除されたメンバーをフィルタリング
  const filteredEvents = events.filter(event => 
    event.member === 'けんじ' || event.member === 'あい'
  );
  
  console.log('getEvents: 完了', filteredEvents);
  return filteredEvents;
}

export async function saveEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Event> {
  console.log('saveEvent: 開始', event);
  
  // IDが存在しない場合は新しいIDを生成
  if (!event.id) {
    event.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  const events = await getEvents();
  const existingIndex = events.findIndex(e => e.id === event.id);
  
  const fullEvent = event as Event;
  
  if (existingIndex >= 0) {
    events[existingIndex] = fullEvent;
    console.log('saveEvent: 更新', fullEvent);
  } else {
    events.push(fullEvent);
    console.log('saveEvent: 追加', fullEvent);
  }
  
  safeSetToLocalStorage(EVENTS_KEY, events);
  return fullEvent;
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  console.log('deleteEvent: 開始', eventId);
  
  const events = await getEvents();
  const originalLength = events.length;
  const filteredEvents = events.filter(e => e.id !== eventId);
  
  if (filteredEvents.length !== originalLength) {
    safeSetToLocalStorage(EVENTS_KEY, filteredEvents);
    console.log('deleteEvent: 削除成功', eventId);
    return true;
  }
  
  console.log('deleteEvent: 削除対象なし', eventId);
  return false;
}

// =====================================================
// Tasks関数
// =====================================================

export async function getTasks(): Promise<string[]> {
  console.log('getTasks: 開始');
  const tasks = safeGetFromLocalStorage<string[]>(TASKS_KEY, initialTasks);
  console.log('getTasks: 完了', tasks);
  return tasks;
}

export async function saveTask(task: string): Promise<string> {
  console.log('saveTask: 開始', task);
  
  const tasks = await getTasks();
  
  if (!tasks.includes(task)) {
    tasks.push(task);
    tasks.sort(); // アルファベット順にソート
    safeSetToLocalStorage(TASKS_KEY, tasks);
    console.log('saveTask: 追加成功', task);
  } else {
    console.log('saveTask: 既に存在', task);
  }
  
  return task;
}

export async function deleteTask(taskName: string): Promise<boolean> {
  console.log('deleteTask: 開始', taskName);
  
  const tasks = await getTasks();
  const originalLength = tasks.length;
  const filteredTasks = tasks.filter(t => t !== taskName);
  
  if (filteredTasks.length !== originalLength) {
    safeSetToLocalStorage(TASKS_KEY, filteredTasks);
    console.log('deleteTask: 削除成功', taskName);
    return true;
  }
  
  console.log('deleteTask: 削除対象なし', taskName);
  return false;
}

// =====================================================
// デバッグ用関数
// =====================================================

export async function getAllData() {
  const [events, tasks] = await Promise.all([
    getEvents(),
    getTasks()
  ]);
  
  return {
    events,
    tasks,
    lastUpdated: new Date().toISOString()
  };
}

export async function resetData(): Promise<void> {
  console.log('resetData: データリセット開始');
  safeSetToLocalStorage(EVENTS_KEY, initialEvents);
  safeSetToLocalStorage(TASKS_KEY, initialTasks);
  console.log('resetData: データリセット完了');
}