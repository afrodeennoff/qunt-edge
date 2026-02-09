# Hetzner + Supabase Production Deployment

This guide deploys QuntEdge on a Hetzner Cloud VPS while using Supabase for PostgreSQL and Auth.

## 1. Prerequisites

- Hetzner Cloud account
- Supabase project
- Domain name (for example `app.example.com`)
- SSH key added to Hetzner Cloud

## 2. Create infrastructure in Hetzner

1. Create a new project in Hetzner Cloud Console.
2. Create a server:
- Image: Ubuntu 24.04
- Type: CPX21 or higher (4 GB RAM recommended)
- Add your SSH key
3. Create and attach a firewall:
- Allow inbound TCP `22`, `80`, `443`
- Deny other inbound ports
4. (Recommended) Enable server backups in Hetzner.

## 3. Configure DNS

Create an `A` record:

- Host: `app`
- Value: your Hetzner server public IPv4

Optional: add `AAAA` to IPv6.

## 4. Install runtime dependencies on server

```bash
ssh root@YOUR_SERVER_IP
apt update && apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin caddy
```

## 5. Deploy app source

```bash
git clone YOUR_REPO_URL /opt/deltalytix
cd /opt/deltalytix
cp .env.example .env
```

## 6. Configure production environment

Edit `/opt/deltalytix/.env` and set these required variables:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

DATABASE_URL=postgresql://... # Supabase transaction/pooler URL
DIRECT_URL=postgresql://...   # Supabase direct URL

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_SERVICE_KEY=...      # same value as SUPABASE_SERVICE_ROLE_KEY

CRON_SECRET=replace-with-long-random-secret
```

Notes:

- `DATABASE_URL` is used at runtime; prefer Supabase pooler URL.
- `DIRECT_URL` is used for migrations.
- This repo also references `SUPABASE_SERVICE_KEY` in one server action, so set both service key vars.

## 7. Run database migrations

Run once on each release before app restart:

```bash
cd /opt/deltalytix
docker compose -f docker-compose.prod.yml --profile migrate run --rm migrate
```

## 8. Start application container

```bash
cd /opt/deltalytix
docker compose -f docker-compose.prod.yml up -d --build app
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

By default the app binds to `127.0.0.1:3000` so it is only accessible through reverse proxy.

## 9. Configure HTTPS reverse proxy (Caddy)

Edit `/etc/caddy/Caddyfile`:

```caddy
app.yourdomain.com {
  reverse_proxy 127.0.0.1:3000
}
```

Apply:

```bash
systemctl restart caddy
systemctl enable caddy
```

Caddy will automatically provision and renew TLS certificates.

## 10. Supabase Auth URL configuration

In Supabase Dashboard:

1. Go to Authentication settings.
2. Set Site URL to `https://app.yourdomain.com`.
3. Add your production callback URLs to Redirect URLs.

## 11. Release workflow

```bash
cd /opt/deltalytix
git pull
docker compose -f docker-compose.prod.yml --profile migrate run --rm migrate
docker compose -f docker-compose.prod.yml up -d --build app
```

## 12. Basic operations

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# Tail logs
docker compose -f docker-compose.prod.yml logs -f app

# Restart app
docker compose -f docker-compose.prod.yml restart app
```

