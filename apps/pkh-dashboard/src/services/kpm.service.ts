import api from '../lib/api';

export const kpmService = {
    getByKelompok: async (kelompokId: string, params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get(`/kelompok/${kelompokId}/kpm`, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/kpm/${id}`);
        return response.data;
    },

    getSummary: async (id: string) => {
        const response = await api.get(`/kpm/${id}/summary`);
        return response.data;
    },

    create: async (kelompokId: string, data: any) => {
        const response = await api.post(`/kelompok/${kelompokId}/kpm`, data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/kpm/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/kpm/${id}`);
        return response.data;
    },
};
