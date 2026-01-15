import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Create a validation middleware for request body
 */
export function validateBody<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Create a validation middleware for request query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query) as typeof req.query;
            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Create a validation middleware for request params
 */
export function validateParams<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.params = schema.parse(req.params) as typeof req.params;
            next();
        } catch (error) {
            next(error);
        }
    };
}

// Common validation schemas
export const uuidParamSchema = z.object({
    id: z.string().uuid('Invalid UUID format'),
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export const searchSchema = z.object({
    q: z.string().optional(),
});
