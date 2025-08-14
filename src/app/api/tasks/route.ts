import { NextRequest, NextResponse } from 'next/server';
import { getTasks, saveTask } from '@/lib/database';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { task } = await request.json();
    
    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid task name is required' },
        { status: 400 }
      );
    }
    
    const savedTask = await saveTask(task);
    return NextResponse.json({ success: true, data: savedTask });
  } catch (error) {
    console.error('Error saving task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save task' },
      { status: 500 }
    );
  }
}