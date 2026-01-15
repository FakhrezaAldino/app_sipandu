
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
    traceId: string;
    userId?: string;
    path?: string;
    method?: string;
}

const context = new AsyncLocalStorage<RequestContext>();

/**
 * Run a function within a given request context
 */
export const runInContext = <T>(ctx: RequestContext, callback: () => T): T => {
    return context.run(ctx, callback);
};

/**
 * Get the current request context
 */
export const getContext = (): RequestContext | undefined => {
    return context.getStore();
};

/**
 * Get the current trace ID
 */
export const getTraceId = (): string | undefined => {
    return context.getStore()?.traceId;
};

/**
 * Get the current user ID
 */
export const getCurrentUser = (): string | undefined => {
    return context.getStore()?.userId;
};
