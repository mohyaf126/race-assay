import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Mock data for chart
  const data = [
    { name: 'Jan', uv: 4000, pv: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398 },
    { name: 'Mar', uv: 2000, pv: 9800 },
    { name: 'Apr', uv: 2780, pv: 3908 },
    { name: 'May', uv: 1890, pv: 4800 },
    { name: 'Jun', uv: 2390, pv: 3800 },
    { name: 'Jul', uv: 3490, pv: 4300 },
  ];

  return NextResponse.json(data);
}
