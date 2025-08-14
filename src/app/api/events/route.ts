import { NextRequest, NextResponse } from 'next/server';
import { getEvents, saveEvent, deleteEvent } from '@/lib/database-simple';

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // イベントIDがない場合は新規作成として扱う
    if (!eventData.id) {
      eventData.id = Date.now().toString();
    }
    
    const savedEvent = await saveEvent(eventData);
    return NextResponse.json({ success: true, data: savedEvent });
  } catch (error) {
    console.error('Error saving event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = await deleteEvent(eventId);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}