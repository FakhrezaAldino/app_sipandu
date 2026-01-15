import api from '../lib/api';

export const jadwalService = {
    create: async (data: any) => {
        const response = await api.post('/jadwal', data);
        return response.data;
    },

    getByKelompok: async (kelompokId: string) => {
        const response = await api.get(`/jadwal/kelompok/${kelompokId}`);
        return response.data;
    },
};
