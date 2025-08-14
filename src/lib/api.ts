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
    // クライアントサイドで直接LocalStorageを使用
    const { getEvents } = await import('@/lib/database-simple');
    return await getEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    // フォールバック: 初期データを返す
    return [
      { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
      { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
      { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
    ];
  }
}

export async function saveEvent(event: Omit<Event, 'id'> | Event): Promise<Event> {
  try {
    // クライアントサイドで直接LocalStorageを使用
    const { saveEvent } = await import('@/lib/database-simple');
    return await saveEvent(event);
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    // クライアントサイドで直接LocalStorageを使用
    const { deleteEvent } = await import('@/lib/database-simple');
    return await deleteEvent(eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

export async function fetchTasks(): Promise<string[]> {
  try {
    // クライアントサイドで直接LocalStorageを使用
    const { getTasks } = await import('@/lib/database-simple');
    return await getTasks();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // フォールバック: 初期データを返す
    return ["仕事", "サックス", "テニス"];
  }
}

export async function saveTask(task: string): Promise<string> {
  try {
    // クライアントサイドで直接LocalStorageを使用
    const { saveTask } = await import('@/lib/database-simple');
    return await saveTask(task);
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
}

export async function deleteTask(taskName: string): Promise<boolean> {
  try {
    // クライアントサイドで直接LocalStorageを使用
    const { deleteTask } = await import('@/lib/database-simple');
    return await deleteTask(taskName);
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}