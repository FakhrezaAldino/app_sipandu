
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { runInContext } from '../lib/context';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Get trace ID from header or generate new one
    const traceId = (req.headers['x-request-id'] as string) ||
        (req.headers['x-trace-id'] as string) ||
        crypto.randomUUID();

    // 2. Set trace ID in response header for client visibility
    res.setHeader('x-trace-id', traceId);

    // 3. Extract user ID if already available (e.g. from earlier auth, though tracing usually comes first)
    // Note: If auth middleware runs AFTER this, the user ID won't be here yet.
    // Ideally, we might updated the context later in the chain if possible, but AsyncLocalStorage is immutable for the run scope.
    // A common pattern is to wrap the user ID extraction in a separate middleware inside the context, 
    // OR just rely on the mutable store pattern if we implemented it that way (we implemented functional runInContext).
    // Let's assume for now we just start the trace. 
    // If we need UserID in logs, we might need to store a mutable object in the context.

    // Let's update our context.ts to allow mutable state if needed? 
    // Actually, AsyncLocalStorage store is the object reference. If we pass an object, we can mutate its properties!
    // My context.ts implementation: `export const runInContext = <T>(ctx: RequestContext, callback: () => T)`
    // RequestContext is an interface. If I pass an object literal, it is mutable.

    const context = {
        traceId,
        path: req.path,
        method: req.method
        // userId will be set by auth middleware if we modify it to write to this context
    };

    // 4. Run next() within the context
    runInContext(context, () => {
        next();
    });
};
