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
    const response = await fetch('/api/events', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Event[]> = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch events');
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error; // エラーを上位に伝播させて適切なハンドリングを行う
  }
}

export async function saveEvent(event: Omit<Event, 'id'> | Event): Promise<Event> {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    const result: ApiResponse<Event> = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to save event');
    }
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/events?id=${eventId}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<boolean> = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

export async function fetchTasks(): Promise<string[]> {
  try {
    const response = await fetch('/api/tasks', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<string[]> = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch tasks');
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error; // エラーを上位に伝播させて適切なハンドリングを行う
  }
}

export async function saveTask(task: string): Promise<string> {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
    });
    
    const result: ApiResponse<string> = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to save task');
    }
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
}