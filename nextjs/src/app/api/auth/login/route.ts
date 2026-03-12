import { NextResponse } from 'next/server';
import { getAdminByUsername, verifyPassword, createAdminUser, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码是必填项' },
        { status: 400 }
      );
    }

    const user = await getAdminByUsername(username);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码不正确' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: '用户名或密码不正确' },
        { status: 401 }
      );
    }

    // Create session cookie
    const sessionData = JSON.stringify({
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      isMaster: user.is_master,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isMaster: user.is_master,
      },
    });

    // Set cookie
    response.cookies.set('war-map-session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// Create default admin if not exists
export async function GET() {
  try {
    const existing = await getAdminByUsername('admin');
    
    if (!existing) {
      await createAdminUser('admin', 'Admin', 'admin123', true);
      await createAdminUser('endvise', 'MasterAdmin', 'a12503934!', true);
      return NextResponse.json({ message: 'Default admins created' });
    }
    
    return NextResponse.json({ message: 'Admin exists' });
  } catch (error) {
    console.error('Create default admin error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
