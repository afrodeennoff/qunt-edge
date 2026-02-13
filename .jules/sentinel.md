## 2026-02-13 - [SSR XSS in Sanitize Function]
**Vulnerability:** The `sanitizeHtml` function returned the raw input HTML when running in a non-browser environment (SSR) because `window` was undefined.
**Learning:** Manual sanitization implementations often fail edge cases like SSR. Checking for `window` existence to conditionally sanitize is dangerous if the fallback is to return unsanitized content.
**Prevention:** Use environment-agnostic libraries like `isomorphic-dompurify` for HTML sanitization instead of custom implementations. Ensure sanitization logic runs on both server and client.
