import { NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === 'admin' && password === 'admin') {
      const accessToken = await signToken({ username }, '20s'); // 20 seconds expiration
      const refreshToken = await signToken({ username }, '1m'); // 1 minute expiration

      return NextResponse.json({ success: true, accessToken, refreshToken });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
