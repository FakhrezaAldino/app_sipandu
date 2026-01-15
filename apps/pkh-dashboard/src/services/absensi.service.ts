import api from '../lib/api';

export const absensiService = {
    getByKelompok: async (kelompokId: string, params?: { page?: number; limit?: number; date?: string }) => {
        const response = await api.get(`/kelompok/${kelompokId}/absensi`, { params });
        return response.data;
    },

    getStats: async (kelompokId: string) => {
        const response = await api.get(`/kelompok/${kelompokId}/absensi/stats`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/absensi/${id}`);
        return response.data;
    },

    create: async (kelompokId: string, data: any) => {
        const response = await api.post(`/kelompok/${kelompokId}/absensi`, data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/absensi/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/absensi/${id}`);
        return response.data;
    },
};
