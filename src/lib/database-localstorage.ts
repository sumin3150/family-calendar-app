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
  version: number; // データ形式のバージョン管理
}

const EVENTS_KEY = 'family-calendar-events';
const TASKS_KEY = 'family-calendar-tasks';
const DATA_KEY = 'family-calendar-data';
const VERSION = 1;

// 初期データ
const initialEvents: Event[] = [
  { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
  { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
  { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
];

const initialTasks: string[] = ["仕事", "サックス", "テニス"];

// データの整合性チェック付きLocalStorage操作
class LocalStorageDB {
  private static instance: LocalStorageDB;
  private isInitialized = false;

  static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  private isServerSide(): boolean {
    return typeof window === 'undefined';
  }

  private async initialize() {
    if (this.isInitialized || this.isServerSide()) return;

    try {
      // 既存データのマイグレーション
      const existingData = this.getData();
      if (!existingData || existingData.version !== VERSION) {
        console.log('LocalStorageDB: 初期化またはマイグレーション実行');
        const newData: DatabaseData = {
          events: existingData?.events || initialEvents,
          tasks: existingData?.tasks || initialTasks,
          lastUpdated: new Date().toISOString(),
          version: VERSION
        };
        this.saveData(newData);
      }
      this.isInitialized = true;
      console.log('LocalStorageDB: 初期化完了');
    } catch (error) {
      console.error('LocalStorageDB: 初期化エラー:', error);
    }
  }

  private getData(): DatabaseData | null {
    if (this.isServerSide()) return null;

    try {
      const data = localStorage.getItem(DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('LocalStorageDB: データ読み取りエラー:', error);
      return null;
    }
  }

  private saveData(data: DatabaseData): void {
    if (this.isServerSide()) return;

    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      console.log('LocalStorageDB: データ保存完了');
    } catch (error) {
      console.error('LocalStorageDB: データ保存エラー:', error);
      throw error;
    }
  }

  async getEvents(): Promise<Event[]> {
    await this.initialize();
    if (this.isServerSide()) return initialEvents;

    const data = this.getData();
    const events = data?.events || initialEvents;
    
    // 削除されたメンバーをフィルタリング
    return events.filter(event => 
      event.member === 'けんじ' || event.member === 'あい'
    );
  }

  async getTasks(): Promise<string[]> {
    await this.initialize();
    if (this.isServerSide()) return initialTasks;

    const data = this.getData();
    return data?.tasks || initialTasks;
  }

  async saveEvent(event: Event): Promise<Event> {
    await this.initialize();
    if (this.isServerSide()) throw new Error('Server-side operation not supported');

    // IDが存在しない場合は新しいIDを生成
    if (!event.id) {
      event.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const data = this.getData() || {
      events: initialEvents,
      tasks: initialTasks,
      lastUpdated: new Date().toISOString(),
      version: VERSION
    };

    const existingIndex = data.events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      data.events[existingIndex] = event;
      console.log(`LocalStorageDB: イベント「${event.task}」を更新`);
    } else {
      data.events.push(event);
      console.log(`LocalStorageDB: イベント「${event.task}」を追加`);
    }

    this.saveData(data);
    return event;
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    await this.initialize();
    if (this.isServerSide()) return false;

    const data = this.getData();
    if (!data) return false;

    const originalLength = data.events.length;
    data.events = data.events.filter(e => e.id !== eventId);
    
    if (data.events.length !== originalLength) {
      this.saveData(data);
      console.log(`LocalStorageDB: イベントID「${eventId}」を削除`);
      return true;
    }

    return false;
  }

  async saveTask(task: string): Promise<string> {
    await this.initialize();
    if (this.isServerSide()) throw new Error('Server-side operation not supported');

    const data = this.getData() || {
      events: initialEvents,
      tasks: initialTasks,
      lastUpdated: new Date().toISOString(),
      version: VERSION
    };

    if (!data.tasks.includes(task)) {
      data.tasks.push(task);
      data.tasks.sort(); // アルファベット順にソート
      this.saveData(data);
      console.log(`LocalStorageDB: タスク「${task}」を追加`);
    } else {
      console.log(`LocalStorageDB: タスク「${task}」は既に存在`);
    }

    return task;
  }

  async deleteTask(taskName: string): Promise<boolean> {
    await this.initialize();
    if (this.isServerSide()) return false;

    const data = this.getData();
    if (!data) return false;

    const originalLength = data.tasks.length;
    data.tasks = data.tasks.filter(t => t !== taskName);

    if (data.tasks.length !== originalLength) {
      this.saveData(data);
      console.log(`LocalStorageDB: タスク「${taskName}」を削除`);
      return true;
    }

    return false;
  }

  async getAllData(): Promise<DatabaseData> {
    const [events, tasks] = await Promise.all([
      this.getEvents(),
      this.getTasks()
    ]);

    return {
      events,
      tasks,
      lastUpdated: new Date().toISOString(),
      version: VERSION
    };
  }

  // デバッグ用: データをリセット
  async resetData(): Promise<void> {
    if (this.isServerSide()) return;

    const newData: DatabaseData = {
      events: initialEvents,
      tasks: initialTasks,
      lastUpdated: new Date().toISOString(),
      version: VERSION
    };

    this.saveData(newData);
    console.log('LocalStorageDB: データをリセット');
  }
}

// エクスポート用の関数
const db = LocalStorageDB.getInstance();

export const getEvents = () => db.getEvents();
export const getTasks = () => db.getTasks();
export const saveEvent = (event: Event) => db.saveEvent(event);
export const deleteEvent = (eventId: string) => db.deleteEvent(eventId);
export const saveTask = (task: string) => db.saveTask(task);
export const deleteTask = (taskName: string) => db.deleteTask(taskName);
export const getAllData = () => db.getAllData();
export const resetData = () => db.resetData();