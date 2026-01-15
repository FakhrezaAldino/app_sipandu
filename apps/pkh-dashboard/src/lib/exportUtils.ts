export const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk di-export');
        return;
    }

    // Flatten objects if needed (e.g., kpm.namaLengkap)
    const flattenedData = data.map(item => {
        const flat: any = {};
        const flatten = (obj: any, prefix = '') => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    flatten(obj[key], `${prefix}${key}_`);
                } else {
                    flat[`${prefix}${key}`] = obj[key];
                }
            }
        };
        flatten(item);
        return flat;
    });

    const headers = Object.keys(flattenedData[0]);
    const csvContent = [
        headers.join(','),
        ...flattenedData.map(row => headers.map(header => {
            const cell = row[header] === null || row[header] === undefined ? '' : row[header];
            return `"${String(cell).replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
