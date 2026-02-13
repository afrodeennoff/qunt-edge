import { describe, it, expect, afterEach } from 'vitest';
import { sanitizeHtml } from '../../lib/sanitize';

describe('sanitizeHtml Security Test', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
  });

  it('should sanitize malicious script tags', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert("XSS")');
  });

  it('should sanitize event handlers', () => {
    const maliciousInput = '<img src="x" onerror="alert(1)">';
    const sanitized = sanitizeHtml(maliciousInput);
    expect(sanitized).not.toContain('onerror');
  });

  it('should sanitize properly even if window is undefined (SSR simulation)', () => {
    // Simulate SSR environment by removing window/document
    // @ts-expect-error - Testing SSR behavior
    delete global.window;
    // @ts-expect-error - Testing SSR behavior
    delete global.document;

    const maliciousInput = '<script>alert("SSR XSS")</script>';
    const sanitized = sanitizeHtml(maliciousInput);

    // In the vulnerable implementation, this returns the input as-is
    // preventing this test from passing if we expect sanitization
    expect(sanitized).not.toContain('<script>');
  }, 1000);
});
