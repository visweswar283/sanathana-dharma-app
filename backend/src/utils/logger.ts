import { env } from '../config/environment';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (env.NODE_ENV === 'test') return;

  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✅',
    warn: '⚠️ ',
    error: '❌',
    debug: '🔍',
  }[level];

  const line = `${prefix} [${timestamp}] ${message}`;

  if (meta !== undefined) {
    console[level === 'debug' ? 'log' : level](line, meta);
  } else {
    console[level === 'debug' ? 'log' : level](line);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => {
    if (env.NODE_ENV === 'development') log('debug', msg, meta);
  },
};
