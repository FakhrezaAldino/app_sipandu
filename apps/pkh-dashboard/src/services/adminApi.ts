import api from '../lib/api';
import type { ApiResponse, PaginatedResponse, UserDTO, KelompokDTO, KpmDTO, AdminDashboardSummaryDTO } from '../types/api';

export const adminApi = {
    /**
     * Dashboard Summary
     */
    getDashboardSummary: async (): Promise<ApiResponse<AdminDashboardSummaryDTO>> => {
        const response = await api.get<ApiResponse<AdminDashboardSummaryDTO>>('/admin/dashboard/summary');
        return response.data;
    },

    /**
     * Pendamping Management
     */
    listPendamping: async (): Promise<ApiResponse<UserDTO[]>> => {
        const response = await api.get<ApiResponse<UserDTO[]>>('/admin/pendamping');
        return response.data;
    },

    createPendamping: async (data: Partial<UserDTO> & { password?: string }): Promise<ApiResponse<UserDTO>> => {
        const response = await api.post<ApiResponse<UserDTO>>('/admin/pendamping', data);
        return response.data;
    },

    updatePendamping: async (id: string, data: Partial<UserDTO>): Promise<ApiResponse<UserDTO>> => {
        const response = await api.put<ApiResponse<UserDTO>>(`/admin/pendamping/${id}`, data);
        return response.data;
    },

    togglePendampingStatus: async (id: string, isActive: boolean): Promise<ApiResponse<UserDTO>> => {
        const response = await api.patch<ApiResponse<UserDTO>>(`/admin/pendamping/${id}/deactivate`, { isActive });
        return response.data;
    },

    /**
     * Kelompok Management
     */
    listKelompok: async (params?: any): Promise<PaginatedResponse<KelompokDTO>> => {
        const response = await api.get<PaginatedResponse<KelompokDTO>>('/admin/kelompok', { params });
        return response.data;
    },

    /**
     * KPM Management
     */
    listKpm: async (params?: any): Promise<PaginatedResponse<KpmDTO>> => {
        const response = await api.get<PaginatedResponse<KpmDTO>>('/admin/kpm', { params });
        return response.data;
    },

    /**
     * Reports
     */
    downloadPdfReport: async (filters?: any): Promise<void> => {
        const response = await api.post('/admin/reports/pdf', filters, {
            responseType: 'blob'
        });

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
