import 'dotenv/config';

export const config = {
    // Server configuration
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        isDev: process.env.NODE_ENV !== 'production',
    },

    // Database configuration
    database: {
        url: process.env.DATABASE_URL || '',
    },

    // Better Auth configuration
    auth: {
        secret: process.env.BETTER_AUTH_SECRET || '',
        url: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    },

    // CORS configuration
    cors: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'BETTER_AUTH_SECRET'];

export function validateConfig() {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
