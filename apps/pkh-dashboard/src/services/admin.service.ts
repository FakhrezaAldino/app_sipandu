import api from '../lib/api';

export interface AdminSummary {
    totalPendamping: number;
    totalKelompok: number;
    totalKpm: number;
    totalAbsensi: number;
    totalUsaha: number;
    totalPrestasi: number;
    totalPermasalahan: number;
    totalGraduasi: number;
}

export const adminService = {
    getDashboardSummary: async (): Promise<AdminSummary> => {
        const response = await api.get('/admin/dashboard/summary');
        return response.data.data || response.data;
    },

    listPendamping: async () => {
        const response = await api.get('/admin/pendamping');
        return response.data;
    },

    createPendamping: async (data: any) => {
        const response = await api.post('/admin/pendamping', data);
        return response.data;
    },

    updatePendamping: async (id: string, data: any) => {
        const response = await api.put(`/admin/pendamping/${id}`, data);
        return response.data;
    },

    togglePendampingStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/admin/pendamping/${id}/deactivate`, { isActive });
        return response.data;
    },

    listKelompok: async (params?: any) => {
        const response = await api.get('/admin/kelompok', { params });
        return response.data;
    },

    listKpm: async (params?: any) => {
        const response = await api.get('/admin/kpm', { params });
        return response.data;
    },

    downloadPdfReport: async (filters?: any) => {
        const response = await api.post('/admin/reports/pdf', filters, {
            responseType: 'blob'
        });

        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PKH-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};
