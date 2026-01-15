import api from '../lib/api';

export const reportService = {
    getDashboardStats: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    },

    getKelompokReport: async (id: string) => {
        const response = await api.get(`/reports/kelompok/${id}`);
        return response.data;
    },

};
