import { NextRequest, NextResponse } from 'next/server';
import { updateUserPresence, getOnlineUsers, removeUserPresence } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const users = await getOnlineUsers(parseInt(sessionId));
    return NextResponse.json(users);
  } catch (error) {
    console.error('Presence GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, nickname, userColor } = await request.json();

    if (!sessionId || !userId || !nickname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = await updateUserPresence(
      parseInt(sessionId),
      parseInt(userId),
      nickname,
      userColor || '#e94560'
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presence POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId || !userId) {
      return NextResponse.json({ error: 'Session ID and User ID are required' }, { status: 400 });
    }

    const success = await removeUserPresence(parseInt(sessionId), parseInt(userId));
    if (!success) {
      return NextResponse.json({ error: 'Failed to remove presence' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presence DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
