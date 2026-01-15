import api from '../lib/api';

export const inputDataService = {
    // Usaha
    usaha: {
        getByKelompok: async (kelompokId: string) => {
            const response = await api.get(`/kelompok/${kelompokId}/usaha`);
            return response.data;
        },
        getByKpm: async (kpmId: string) => {
            const response = await api.get(`/kpm/${kpmId}/usaha`);
            return response.data;
        },
        create: async (kpmId: string, data: any) => {
            const response = await api.post(`/kpm/${kpmId}/usaha`, data);
            return response.data;
        },
        update: async (id: string, data: any) => {
            const response = await api.patch(`/usaha/${id}`, data);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await api.delete(`/usaha/${id}`);
            return response.data;
        },
    },

    // Prestasi
    prestasi: {
        getByKelompok: async (kelompokId: string) => {
            const response = await api.get(`/kelompok/${kelompokId}/prestasi`);
            return response.data;
        },
        getByKpm: async (kpmId: string) => {
            const response = await api.get(`/kpm/${kpmId}/prestasi`);
            return response.data;
        },
        create: async (kpmId: string, data: any) => {
            const response = await api.post(`/kpm/${kpmId}/prestasi`, data);
            return response.data;
        },
        update: async (id: string, data: any) => {
            const response = await api.patch(`/prestasi/${id}`, data);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await api.delete(`/prestasi/${id}`);
            return response.data;
        },
    },

    // Permasalahan
    permasalahan: {
        getByKelompok: async (kelompokId: string) => {
            const response = await api.get(`/kelompok/${kelompokId}/permasalahan`);
            return response.data;
        },
        getByKpm: async (kpmId: string) => {
            const response = await api.get(`/kpm/${kpmId}/permasalahan`);
            return response.data;
        },
        create: async (kpmId: string, data: any) => {
            const response = await api.post(`/kpm/${kpmId}/permasalahan`, data);
            return response.data;
        },
        update: async (id: string, data: any) => {
            const response = await api.patch(`/permasalahan/${id}`, data);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await api.delete(`/permasalahan/${id}`);
            return response.data;
        },
    },

    // Graduasi
    graduasi: {
        getByKelompok: async (kelompokId: string) => {
            const response = await api.get(`/kelompok/${kelompokId}/graduasi`);
            return response.data;
        },
        create: async (kpmId: string, data: any) => {
            const response = await api.post(`/kpm/${kpmId}/graduasi`, data);
            return response.data;
        },
        update: async (id: string, data: any) => {
            const response = await api.patch(`/graduasi/${id}`, data);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await api.delete(`/graduasi/${id}`);
            return response.data;
        },
    },
};
