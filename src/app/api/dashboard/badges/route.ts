import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Mock data for badges
  const data = [
    { id: 1, title: 'Total Users', value: '1,234' },
    { id: 2, title: 'Revenue', value: '$12,345' },
    { id: 3, title: 'Active Sessions', value: '42' },
  ];

  return NextResponse.json(data);
}
