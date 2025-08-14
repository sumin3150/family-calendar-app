import { promises as fs } from 'fs';
import path from 'path';

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

// Vercelでは/tmp以外の書き込みができないため、メモリ内データベースとして実装
let memoryDatabase: DatabaseData = {
  events: [
    { id: "1", date: "2025-08-05", time: "09:00", task: "仕事", member: "けんじ" },
    { id: "2", date: "2025-08-06", time: "18:00", task: "サックス", member: "あい" },
    { id: "3", date: "2025-08-09", time: "08:00", task: "テニス", member: "けんじ" }
  ],
  tasks: ["仕事", "サックス", "テニス"],
  lastUpdated: new Date().toISOString()
};

export async function getEvents(): Promise<Event[]> {
  return memoryDatabase.events;
}

export async function getTasks(): Promise<string[]> {
  return memoryDatabase.tasks;
}

export async function saveEvent(event: Event): Promise<Event> {
  // 既存のイベントを更新または新規追加
  const existingIndex = memoryDatabase.events.findIndex(e => e.id === event.id);
  
  if (existingIndex >= 0) {
    memoryDatabase.events[existingIndex] = event;
  } else {
    memoryDatabase.events.push(event);
  }
  
  memoryDatabase.lastUpdated = new Date().toISOString();
  return event;
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  const initialLength = memoryDatabase.events.length;
  memoryDatabase.events = memoryDatabase.events.filter(e => e.id !== eventId);
  memoryDatabase.lastUpdated = new Date().toISOString();
  
  return memoryDatabase.events.length < initialLength;
}

export async function saveTask(task: string): Promise<string> {
  if (!memoryDatabase.tasks.includes(task)) {
    memoryDatabase.tasks.push(task);
    memoryDatabase.lastUpdated = new Date().toISOString();
  }
  return task;
}

export async function getAllData(): Promise<DatabaseData> {
  return { ...memoryDatabase };
}