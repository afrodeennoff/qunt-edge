# Route Performance Tracker

| Route | Class | Render Mode | Cache Policy | JS Budget | TBT Budget | LCP Budget | Status |
|---|---|---|---|---:|---:|---:|---|
| `/en` | Public | ISR | `public, max-age=0, must-revalidate` | 80 KB app manifest | 200ms desktop / 1200ms mobile | 1.8s desktop / 3.5s mobile | Hardening complete; prod baseline pending |
| `/en/pricing` | Public | ISR | `public, max-age=0, must-revalidate` | 300 KB route payload | 200ms desktop / 1200ms mobile | 1.8s desktop / 3.5s mobile | Hardening complete; prod baseline pending |
| `/en/updates` | Public | ISR | `public, max-age=0, must-revalidate` | 300 KB route payload | 200ms desktop / 1200ms mobile | 1.8s desktop / 3.5s mobile | Hardening complete; prod baseline pending |
| `/en/updates/[slug]` | Public | ISR | `public, max-age=0, must-revalidate` | 300 KB route payload | 200ms desktop / 1200ms mobile | 1.8s desktop / 3.5s mobile | Hardening complete; prod baseline pending |
| `/en/dashboard` | Private | Dynamic | `no-store` | 80 KB app manifest | 300ms desktop | 2.5s desktop | Hardening complete; prod baseline pending |
| `/en/dashboard/strategies` | Private | Dynamic | `no-store` | 80 KB app manifest | 300ms desktop | 2.5s desktop | Hardening complete; prod baseline pending |
