/**
 * Utility functions for the application
 */

/**
 * Format a date to Indonesian format (DD MMMM YYYY)
 */
export function formatDateIndonesia(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num);
}

/**
 * Generate a random string for tokens, etc.
 */
export function generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Paginate results
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
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

export function paginate<T>(
    data: T[],
    total: number,
    { page = 1, limit = 10 }: PaginationParams
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
}
