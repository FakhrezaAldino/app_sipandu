
import { logger } from './src/lib/logger';
import { runInContext, getTraceId } from './src/lib/context';
import { ApiError } from './src/middleware/error';

console.log('--- Starting Logging Verification ---');

// 1. Test Logger without context
logger.info('Log without context');

// 2. Test Logger WITH context
runInContext({ traceId: 'test-trace-123', userId: 'user-abc', method: 'GET', path: '/test' }, () => {
    logger.info('Log WITH context');
    logger.warn('Warning with context', { someMetadata: 'value' });

    // Check trace ID retrieval
    const currentTrace = getTraceId();
    console.log(`Retrieved Trace ID: ${currentTrace} (Expected: test-trace-123)`);

    // Simulate Error logging
    try {
        throw new Error('Simulated verification error');
    } catch (err: any) {
        logger.error('Caught error in context', { error: err.message });
    }
});

console.log('--- Verification Complete ---');
