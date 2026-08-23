import { NextResponse } from 'next/server';
import { signToken, verifyToken } from '@/lib/jwt';
import { isRefreshTokenUsed, markRefreshTokenAsUsed } from '@/lib/tokenStore';

// We add an artificial delay to make the race condition more likely to overlap
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(request: Request) {
  const { refreshToken: currentRefreshToken } = await request.json();

  if (!currentRefreshToken) {
    return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
  }

  // Simulate network delay to exaggerate the race condition window
  await delay(1000);

  // RACE CONDITION PENALTY:
  // If multiple concurrent requests use the same refresh token, 
  // only the first one succeeds. The rest will fail here.
  if (isRefreshTokenUsed(currentRefreshToken)) {
    return NextResponse.json({ error: 'Refresh token already used. Potential race condition detected.' }, { status: 403 });
  }

  const payload = await verifyToken(currentRefreshToken);
  
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
  }

  // Mark token as used immediately so concurrent requests fail
  markRefreshTokenAsUsed(currentRefreshToken);

  // Generate new tokens
  const newAccessToken = await signToken({ username: payload.username }, '20s');
  const newRefreshToken = await signToken({ username: payload.username }, '1m');

  return NextResponse.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
}
