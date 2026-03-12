import { NextRequest, NextResponse } from 'next/server';
import { getIconsBySession, createIcon, updateIconPosition, deleteIcon } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const icons = await getIconsBySession(parseInt(sessionId));
    return NextResponse.json(icons);
  } catch (error) {
    console.error('Icons GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userName, x, y, borderColor, placedBy } = await request.json();

    if (!sessionId || !userName || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const icon = await createIcon(
      parseInt(sessionId),
      userName,
      parseInt(x),
      parseInt(y),
      borderColor || '#e94560',
      placedBy
    );

    if (!icon) {
      return NextResponse.json({ error: 'Failed to create icon' }, { status: 500 });
    }

    return NextResponse.json(icon);
  } catch (error) {
    console.error('Icons POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, x, y } = await request.json();

    if (!id || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = await updateIconPosition(id, parseInt(x), parseInt(y));
    if (!success) {
      return NextResponse.json({ error: 'Failed to update icon' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Icons PATCH error:', error);
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

    const success = await deleteIcon(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete icon' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Icons DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
