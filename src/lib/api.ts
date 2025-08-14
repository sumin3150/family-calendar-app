interface Event {
  id: string;
  date: string;
  time: string;
  task: string;
  member: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchEvents(): Promise<Event[]> {
  try {
    // ブラウザ環境でのみ環境変数をチェック
    const url = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
    const key = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
    
    console.log('[API fetchEvents] Environment check - URL:', url ? 'Set' : 'Missing', 'Key:', key ? 'Set' : 'Missing');
    
    if (url && key) {
      console.log('[API] Using Supabase backend for events');
      const { getEvents } = await import('@/lib/database-supabase');
      return await getEvents();
    } else {
      console.log('[API] Supabase not configured, using LocalStorage for events');
      const { getEvents } = await import('@/lib/database-simple');
      return await getEvents();
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    // エラー時はLocalStorageにフォールバック
    try {
      console.log('[API] Fallback to LocalStorage due to error');
      const { getEvents } = await import('@/lib/database-simple');
      return await getEvents();
    } catch (fallbackError) {
      console.error('LocalStorage fallback failed:', fallbackError);
      // 最終フォールバック: 初期データを返す
      return [
        { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
        { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
        { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
      ];
    }
  }
}

export async function saveEvent(event: Omit<Event, 'id'> | Event): Promise<Event> {
  try {
    // Supabaseを優先、フォールバックでLocalStorage
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (url && key) {
      console.log('[API] Saving to Supabase backend');
      const { saveEvent } = await import('@/lib/database-supabase');
      return await saveEvent(event);
    } else {
      console.log('[API] Supabase not configured, saving to LocalStorage');
      const { saveEvent } = await import('@/lib/database-simple');
      return await saveEvent(event);
    }
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    // Supabaseを優先、フォールバックでLocalStorage
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (url && key) {
      console.log('[API] Deleting from Supabase backend');
      const { deleteEvent } = await import('@/lib/database-supabase');
      return await deleteEvent(eventId);
    } else {
      console.log('[API] Supabase not configured, deleting from LocalStorage');
      const { deleteEvent } = await import('@/lib/database-simple');
      return await deleteEvent(eventId);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

export async function fetchTasks(): Promise<string[]> {
  try {
    // ブラウザ環境でのみ環境変数をチェック
    const url = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
    const key = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
    
    console.log('[API fetchTasks] Environment check - URL:', url ? 'Set' : 'Missing', 'Key:', key ? 'Set' : 'Missing');
    
    if (url && key) {
      console.log('[API] Fetching tasks from Supabase backend');
      const { getTasks } = await import('@/lib/database-supabase');
      return await getTasks();
    } else {
      console.log('[API] Supabase not configured, fetching tasks from LocalStorage');
      const { getTasks } = await import('@/lib/database-simple');
      return await getTasks();
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // エラー時はLocalStorageにフォールバック
    try {
      console.log('[API] Fallback to LocalStorage for tasks due to error');
      const { getTasks } = await import('@/lib/database-simple');
      return await getTasks();
    } catch (fallbackError) {
      console.error('LocalStorage fallback failed:', fallbackError);
      // 最終フォールバック: 初期データを返す
      return ["仕事", "サックス", "テニス"];
    }
  }
}

export async function saveTask(task: string): Promise<string> {
  try {
    // ブラウザ環境でのみ環境変数をチェック
    const url = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
    const key = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
    
    console.log('[API saveTask] Environment check - URL:', url ? 'Set' : 'Missing', 'Key:', key ? 'Set' : 'Missing');
    console.log('[API saveTask] Attempting to save task:', task);
    
    if (url && key) {
      console.log('[API] Saving task to Supabase backend');
      const { saveTask } = await import('@/lib/database-supabase');
      const result = await saveTask(task);
      console.log('[API] Task saved to Supabase successfully:', result);
      return result;
    } else {
      console.log('[API] Supabase not configured, saving task to LocalStorage');
      const { saveTask } = await import('@/lib/database-simple');
      const result = await saveTask(task);
      console.log('[API] Task saved to LocalStorage:', result);
      return result;
    }
  } catch (error) {
    console.error('Error saving task:', error);
    // エラー時はLocalStorageにフォールバック
    try {
      console.log('[API] Fallback to LocalStorage for task save due to error');
      const { saveTask } = await import('@/lib/database-simple');
      return await saveTask(task);
    } catch (fallbackError) {
      console.error('LocalStorage fallback failed:', fallbackError);
      throw fallbackError;
    }
  }
}

export async function deleteTask(taskName: string): Promise<boolean> {
  try {
    // Supabaseを優先、フォールバックでLocalStorage
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (url && key) {
      console.log('[API] Deleting task from Supabase backend');
      const { deleteTask } = await import('@/lib/database-supabase');
      return await deleteTask(taskName);
    } else {
      console.log('[API] Supabase not configured, deleting task from LocalStorage');
      const { deleteTask } = await import('@/lib/database-simple');
      return await deleteTask(taskName);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}