import { NextRequest, NextResponse } from 'next/server';
import { getDrawingsBySession, createDrawing, updateDrawingPoints, deleteDrawing } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const drawings = await getDrawingsBySession(parseInt(sessionId));
    return NextResponse.json(drawings);
  } catch (error) {
    console.error('Drawings GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, points, color, strokeWidth, createdBy } = await request.json();

    if (!sessionId || !type || !points) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const drawing = await createDrawing(
      parseInt(sessionId),
      type,
      points,
      color || '#e94560',
      strokeWidth || 3,
      createdBy
    );

    if (!drawing) {
      return NextResponse.json({ error: 'Failed to create drawing' }, { status: 500 });
    }

    return NextResponse.json(drawing);
  } catch (error) {
    console.error('Drawings POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, points } = await request.json();

    if (!id || !points) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = await updateDrawingPoints(id, points);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update drawing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Drawings PATCH error:', error);
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

    const success = await deleteDrawing(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete drawing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Drawings DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
