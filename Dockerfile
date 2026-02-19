# 1. Base Image
FROM node:20-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app

# Install build dependencies for native modules (canvas, etc.)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config

COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder Stage
FROM base AS builder
WORKDIR /app
ENV NEXT_STANDALONE=1
ENV NEXT_OUTPUT_STANDALONE=true

# Install build dependencies for native modules during build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and Build
RUN npx prisma generate
RUN npm run build

# 4. Runner Stage (Final Production Image)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime libraries for native modules
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy only necessary files (Standalone mode)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
