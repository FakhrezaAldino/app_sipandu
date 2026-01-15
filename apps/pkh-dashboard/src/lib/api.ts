import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = error.response?.data?.message || 'Terjadi kesalahan pada server';

        // Include validation details if present
        if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
            const details = error.response.data.details
                .map((d: any) => `${d.field}: ${d.message}`)
                .join(', ');
            message = `${message} (${details})`;
        }

        // Handle 401 Unauthorized (except for auth routes)
        if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
            // Optional: redirect to login or clear session
            console.error('Session expired or unauthorized');
        }

        return Promise.reject(new Error(message));
    }
);

export default api;
