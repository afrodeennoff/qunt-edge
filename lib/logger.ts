
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

const SENSITIVE_KEYS = new Set([
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'secret',
  'password',
  'apikey',
  'apiKey',
  'clientSecret',
  'tokenCiphertext',
  'tokenTag',
  'tokenIv',
])

function redactValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length <= 8) return '[REDACTED]'
    return `${value.slice(0, 2)}***${value.slice(-2)}`
  }
  return '[REDACTED]'
}

function redactMeta(meta: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = {}
  for (const [key, value] of Object.entries(meta)) {
    const isSensitive = SENSITIVE_KEYS.has(key) || /token|secret|password|authorization/i.test(key)
    if (isSensitive) {
      output[key] = redactValue(value)
      continue
    }

    if (Array.isArray(value)) {
      output[key] = value.map((item) =>
        item && typeof item === 'object' ? redactMeta(item as Record<string, any>) : item
      )
      continue
    }

    if (value && typeof value === 'object') {
      output[key] = redactMeta(value as Record<string, any>)
      continue
    }

    output[key] = value
  }
  return output
}

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
  const currentLevel = levels[LOG_LEVEL as LogLevel] || levels.info;
  if (levels[level] < currentLevel) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...redactMeta(meta),
  };

  // In production, you might strip colors or format as JSON directly
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    // Development friendly format
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    console.log(`[${entry.timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`);
  }
}

export const logger = {
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
  info: (msg: string, meta?: any) => log('info', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
};
