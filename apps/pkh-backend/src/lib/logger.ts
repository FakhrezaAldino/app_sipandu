
import winston from 'winston';
import { config } from '../config';
import { getContext } from './context';

// Custom format to inject context (Trace ID, User ID) into logs
const injectContext = winston.format((info) => {
    const ctx = getContext();
    if (ctx) {
        info.traceId = ctx.traceId;
        if (ctx.userId) info.userId = ctx.userId;
    }
    return info;
});

const devFormat = winston.format.combine(
    injectContext(),
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, traceId, userId, stack, ...meta }) => {
        const traceStr = traceId ? `[Trace:${traceId}]` : '';
        const userStr = userId ? `[User:${userId}]` : '';
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        const stackStr = stack ? `\n${stack}` : '';

        return `${timestamp} ${level} ${traceStr}${userStr}: ${message}${metaStr}${stackStr}`;
    })
);

const prodFormat = winston.format.combine(
    injectContext(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: config.server.isDev ? 'debug' : 'info',
    format: config.server.isDev ? devFormat : prodFormat,
    defaultMeta: { service: 'pkh-backend' },
    transports: [
        new winston.transports.Console(),
        // File transports
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});
