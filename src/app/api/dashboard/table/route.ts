import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // Mock data for table
  const data = [
    { id: 1, name: 'Alice', status: 'Active', role: 'Admin' },
    { id: 2, name: 'Bob', status: 'Offline', role: 'User' },
    { id: 3, name: 'Charlie', status: 'Active', role: 'Moderator' },
    { id: 4, name: 'Diana', status: 'Offline', role: 'User' },
  ];

  return NextResponse.json(data);
}
