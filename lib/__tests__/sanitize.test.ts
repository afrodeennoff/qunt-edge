import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

describe('sanitizeHtml Security Vulnerability Fix', () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    vi.resetModules(); // Clear module cache to ensure isomorphic-dompurify re-initializes
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.resetModules();
  });

  it('should sanitize HTML in SSR environment (window undefined)', async () => {
    // 1. Force SSR environment by removing window/document
    // @ts-ignore
    delete global.window;
    // @ts-ignore
    delete global.document;

    // 2. Import module (isomorphic-dompurify will detect NO window and use its internal JSDOM)
    const { sanitizeHtml } = await import('../sanitize');

    const maliciousHtml = '<img src=x onerror=alert(1)>';
    const output = sanitizeHtml(maliciousHtml);

    expect(output).not.toContain('onerror');
    // Expect clean HTML. DOMPurify typically produces <img src="x">
    expect(output).toBe('<img src="x">');
  });

  it('should sanitize in browser-like environment (with valid JSDOM)', async () => {
      // 1. Setup a valid JSDOM environment so isomorphic-dompurify works
      const { JSDOM } = await import('jsdom');
      const dom = new JSDOM('<!DOCTYPE html>');
      global.window = dom.window as any;
      global.document = dom.window.document;

      // 2. Import module (isomorphic-dompurify will see window and use it)
      const { sanitizeHtml } = await import('../sanitize');

      const maliciousHtml = '<img src=x onerror=alert(1)>';
      const output = sanitizeHtml(maliciousHtml);

      expect(output).not.toContain('onerror');
      expect(output).toBe('<img src="x">');
  });

  it('should allow safe HTML', async () => {
      // Reuse SSR setup for simplicity
      // @ts-ignore
      delete global.window;
      // @ts-ignore
      delete global.document;

      const { sanitizeHtml } = await import('../sanitize');

      const safeHtml = '<p>Hello <b>World</b></p>';
      const output = sanitizeHtml(safeHtml);
      expect(output).toBe(safeHtml);
  });
});
