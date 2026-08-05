import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
  return normalized;
}

export function hashBuyerEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) throw new Error('Invalid email.');
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}

export function generateClaimToken() {
  return randomBytes(32).toString('base64url');
}

export function generateSignedClaimToken(pepper, now = Date.now(), ttlMs = 30 * 60_000) {
  if (typeof pepper !== 'string' || pepper.length < 16) throw new Error('Claim token pepper is not configured.');
  const payload = Buffer.from(JSON.stringify({
    nonce: generateClaimToken(),
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ttlMs) / 1000),
  })).toString('base64url');
  const signature = createHmac('sha256', pepper).update(payload, 'utf8').digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySignedClaimToken(token, pepper, now = Date.now()) {
  if (typeof token !== 'string' || token.length < 64 || token.length > 512 || typeof pepper !== 'string') return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;
  const expected = createHmac('sha256', pepper).update(payload, 'utf8').digest();
  let supplied;
  try { supplied = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  let claims;
  try { claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return null; }
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)) return null;
  if (claims.iat > nowSeconds + 60 || claims.exp <= nowSeconds || claims.exp - claims.iat > 30 * 60) return null;
  if (typeof claims.nonce !== 'string' || claims.nonce.length !== 43) return null;
  return { valid: true, ...claims };
}

export function hashClaimToken(token, pepper) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 256) throw new Error('Invalid claim token.');
  if (typeof pepper !== 'string' || pepper.length < 16) throw new Error('Claim token pepper is not configured.');
  return createHmac('sha256', pepper).update(token, 'utf8').digest('hex');
}

export function hashClaimRateBucket(parts, pepper) {
  if (!Array.isArray(parts) || typeof pepper !== 'string' || pepper.length < 16) throw new Error('Claim rate limit is not configured.');
  return createHmac('sha256', pepper).update(parts.join('\u001f'), 'utf8').digest('hex');
}

export function verifyShopifyHmac(rawBody, providedSignature, secret) {
  if (!Buffer.isBuffer(rawBody) || typeof providedSignature !== 'string' || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  let supplied;
  try { supplied = Buffer.from(providedSignature, 'base64'); } catch { return false; }
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
