import { NextRequest } from 'next/server';

export function getRequestIp(request: NextRequest | Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

export function sanitizeText(input: unknown, maxLength: number) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function sanitizeEmail(input: unknown) {
  const email = sanitizeText(input, 320).toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return isValid ? email : '';
}

export function sanitizeUrl(input: unknown) {
  const raw = sanitizeText(input, 2048);
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
}
