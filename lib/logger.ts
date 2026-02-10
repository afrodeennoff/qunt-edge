const isProduction = process.env.NODE_ENV === 'production';
const isDebugEnabled = process.env.DEBUG === 'true';

export const logger = {
  info: (...args: any[]) => {
    if (isProduction) {
      console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message: args }));
    } else {
      console.log(new Date().toISOString(), '[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (isProduction) {
      console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message: args }));
    } else {
      console.warn(new Date().toISOString(), '[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (isProduction) {
      console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message: args }));
    } else {
      console.error(new Date().toISOString(), '[ERROR]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (!isProduction || isDebugEnabled) {
      if (isProduction) {
        console.debug(JSON.stringify({ level: 'debug', timestamp: new Date().toISOString(), message: args }));
      } else {
        console.debug(new Date().toISOString(), '[DEBUG]', ...args);
      }
    }
  },
};
