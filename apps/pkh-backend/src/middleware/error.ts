import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';
import { logger } from '../lib/logger';
import { getTraceId } from '../lib/context';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static badRequest(message: string, details?: unknown) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message: string = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message: string = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message: string, details?: unknown) {
        return new ApiError(409, message, details);
    }

    static internal(message: string = 'Internal server error') {
        return new ApiError(500, message);
    }
}

/**
 * Global error handler middleware
 */
export const errorHandler: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // console.error('Error:', err); // Replaced by logger
    const traceId = getTraceId();

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        logger.warn('Validation Error', {
            error: err.message,
            details: err.errors,
            path: req.path,
            method: req.method
        });

        res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Invalid request data',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
            traceId
        });
        return;
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        logger.warn(`API Error: ${err.message}`, {
            statusCode: err.statusCode,
            details: err.details,
            name: err.name
        });

        res.status(err.statusCode).json({
            success: false,
            error: err.name,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
            traceId
        });
        return;
    }

    // Handle unknown errors
    logger.error('Unhandled System Error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: config.server.isDev ? err.message : 'An unexpected error occurred',
        ...(config.server.isDev ? { stack: err.stack } : {}),
        traceId
    });
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
};
