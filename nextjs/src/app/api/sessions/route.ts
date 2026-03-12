import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, getSessionById, createSession, deleteSession } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const session = await getSessionById(parseInt(id));
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json(session);
    }

    const sessions = await getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Sessions GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, eventType, createdBy } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const session = await createSession(name, eventType || 'general', createdBy);
    if (!session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Sessions POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const success = await deleteSession(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sessions DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
