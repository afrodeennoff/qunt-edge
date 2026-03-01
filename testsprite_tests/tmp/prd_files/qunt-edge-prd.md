# Qunt Edge PRD

## Goal
Validate public landing routes, authentication, and authenticated dashboard navigation for Qunt Edge.

## Primary User Journeys
1. Visitor lands on `/en` and can navigate to pricing, support, updates, and authentication.
2. User signs in using email/password.
3. Authenticated user accesses `/en/dashboard` and key sections (`strategies`, `reports`, `billing`, `settings`, `import`).
4. Basic teams and community pages load.

## Non-Functional
- Pages should render without runtime errors.
- Navigation links and core CTAs should be interactive.
- Protected routes should enforce authentication.

## Test Account
- email: xapis30734@hutudns.com
- password: 12345678

## Environment
- Production URL: https://qunt-edge.vercel.app/en
- Local app path: /Users/timon/Downloads/final-qunt-edge-main
