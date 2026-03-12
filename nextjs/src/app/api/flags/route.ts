import { NextRequest, NextResponse } from 'next/server';
import { getFlagsBySession, createFlag, updateFlagMemo, updateFlagPosition, deleteFlag } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const flags = await getFlagsBySession(parseInt(sessionId));
    return NextResponse.json(flags);
  } catch (error) {
    console.error('Flags GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, x, y, memo, createdBy } = await request.json();

    if (!sessionId || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const flag = await createFlag(
      parseInt(sessionId),
      parseInt(x),
      parseInt(y),
      memo || '',
      createdBy
    );

    if (!flag) {
      return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Flags POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, x, y, memo } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let success = false;
    
    if (x !== undefined && y !== undefined) {
      success = await updateFlagPosition(id, parseInt(x), parseInt(y));
    } else if (memo !== undefined) {
      success = await updateFlagMemo(id, memo);
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Flags PATCH error:', error);
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

    const success = await deleteFlag(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Flags DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
