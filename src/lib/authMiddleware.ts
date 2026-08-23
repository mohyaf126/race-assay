import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function requireAuth() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const accessToken = authHeader.split(' ')[1];

  const payload = await verifyToken(accessToken);
  if (!payload) {
    return { error: NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 }) };
  }

  return { payload };
}
