import crypto from 'crypto';

export function generateCamperCode(orgCode: string) {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${orgCode}-${year}-${suffix}`;
}

export function createOpaqueToken() {
  return crypto.randomBytes(18).toString('base64url');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
