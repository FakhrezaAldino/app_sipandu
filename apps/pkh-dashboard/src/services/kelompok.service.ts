import api from '../lib/api';

export const kelompokService = {
    getAll: async (params?: { page?: number; limit?: number; q?: string; date?: string }) => {
        const response = await api.get('/kelompok', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/kelompok/${id}`);
        return response.data;
    },

    getStats: async (id: string) => {
        const response = await api.get(`/kelompok/${id}/stats`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/kelompok', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/kelompok/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/kelompok/${id}`);
        return response.data;
    },
};
