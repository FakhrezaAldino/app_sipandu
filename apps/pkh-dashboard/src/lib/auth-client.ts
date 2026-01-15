import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001',
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'pendamping',
            },
        },
    },
});
