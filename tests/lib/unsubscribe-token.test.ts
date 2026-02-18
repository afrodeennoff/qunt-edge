import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUnsubscribeToken, verifyUnsubscribeToken } from '../../lib/unsubscribe-token';

describe('Unsubscribe Token Secret Reuse Vulnerability', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.UNSUBSCRIBE_TOKEN_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should THROW if UNSUBSCRIBE_TOKEN_SECRET is missing, even if CRON_SECRET is present (Fix Verified)', () => {
    process.env.CRON_SECRET = 'a_very_long_random_secret_string_for_cron_at_least_32_chars';

    // This should now throw because the fallback is removed
    expect(() => createUnsubscribeToken('test@example.com')).toThrow('Missing unsubscribe token secret');
  });

  it('should succeed when UNSUBSCRIBE_TOKEN_SECRET is set', () => {
    process.env.UNSUBSCRIBE_TOKEN_SECRET = 'a_very_long_secure_secret_for_unsubscribe_tokens_at_least_32_chars';

    const token = createUnsubscribeToken('test@example.com');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(2);

    // Verify works with the correct secret
    const isValid = verifyUnsubscribeToken(token, 'test@example.com');
    expect(isValid).toBe(true);

    // Verify fails with wrong email
    expect(verifyUnsubscribeToken(token, 'wrong@example.com')).toBe(false);
  });

  it('should fail verification if signature is tampered', () => {
    process.env.UNSUBSCRIBE_TOKEN_SECRET = 'a_very_long_secure_secret_for_unsubscribe_tokens_at_least_32_chars';
    const token = createUnsubscribeToken('test@example.com');
    const [payload, signature] = token.split('.');

    // Tamper with payload
    const tamperedPayload = Buffer.from(JSON.stringify({
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 100000
    })).toString('base64').replace(/=/g, '');

    expect(verifyUnsubscribeToken(`${tamperedPayload}.${signature}`, 'test@example.com')).toBe(false);
  });

  it('should throw if secret is too short', () => {
      process.env.UNSUBSCRIBE_TOKEN_SECRET = 'short';
      expect(() => createUnsubscribeToken('test@example.com')).toThrow('Missing unsubscribe token secret');
  });
});
