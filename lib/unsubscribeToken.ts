import { createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET is not set');
  return secret;
}

export function signUnsubscribeToken(userId: string): string {
  return createHmac('sha256', getSecret()).update(userId).digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = Buffer.from(signUnsubscribeToken(userId), 'hex');
  const given = Buffer.from(token, 'hex');
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}
