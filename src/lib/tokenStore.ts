// In-memory store to simulate single-use refresh tokens for the race condition assessment
// In a real app, this would be in a database or Redis
const usedRefreshTokens = new Set<string>();

export function isRefreshTokenUsed(token: string) {
  return usedRefreshTokens.has(token);
}

export function markRefreshTokenAsUsed(token: string) {
  usedRefreshTokens.add(token);
}
