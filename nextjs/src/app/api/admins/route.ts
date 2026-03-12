import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins, getAdminById, createAdminUser, deleteAdminUser, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const admin = await getAdminById(parseInt(id));
      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }
      return NextResponse.json(admin);
    }

    const admins = await getAllAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    console.error('Admins GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, nickname, password, isMaster } = await request.json();

    if (!username || !nickname || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const admin = await createAdminUser(username, nickname, password, isMaster || false);
    if (!admin) {
      return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Admins POST error:', error);
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

    const success = await deleteAdminUser(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admins DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
