export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface UserDTO {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string | Date;
}

export interface KelompokDTO {
    id: string;
    namaKelompok: string;
    kecamatan: string;
    desa: string;
    pendampingId: string | null;
    createdAt: string | Date;
    pendamping?: UserDTO;
    kpmCount?: number;
    usahaCount?: number;
    prestasiCount?: number;
    permasalahanCount?: number;
    graduasiCount?: number;
    isAbsenThisMonth?: boolean;
    lastAbsenDate?: string | Date | null;
}

export interface KpmDTO {
    id: string;
    nik: string;
    namaLengkap: string;
    kelompokId: string;
    isActive: boolean;
    isGraduated?: boolean;
    createdAt: string | Date;
    kelompok?: {
        id: string;
        namaKelompok: string;
    };
}

export interface AdminDashboardSummaryDTO {
    totalPendamping: number;
    totalKelompok: number;
    totalKpm: number;
    totalAbsensi: number;
    totalUsaha: number;
    totalPrestasi: number;
    totalPermasalahan: number;
    totalGraduasi: number;
}
