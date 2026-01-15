
import { db } from './src/db';
import { kelompok, absensi, absensiDetail } from './src/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

async function check() {
    console.log('--- START DIAGNOSTIC ---');
    const ks = await db.query.kelompok.findMany({
        where: (k, { or, ilike }) => or(ilike(k.namaKelompok, '%Power%'), ilike(k.namaKelompok, '%Mawar%'))
    });

    for (const k of ks) {
        console.log(`\nKelompok: ${k.namaKelompok} (${k.id})`);
        const recentAbsensi = await db.query.absensi.findMany({
            where: eq(absensi.kelompokId, k.id),
            orderBy: (a, { desc }) => [desc(a.tanggal)],
            limit: 5
        });

        if (recentAbsensi.length === 0) {
            console.log('  No attendance found.');
        } else {
            for (const a of recentAbsensi) {
                const details = await db.query.absensiDetail.findMany({
                    where: eq(absensiDetail.absensiId, a.id)
                });
                console.log(`  Absensi ID: ${a.id} | Tanggal: ${a.tanggal} (Type: ${typeof a.tanggal}) | Details Count: ${details.length}`);
                console.log(`    Date ISO: ${new Date(a.tanggal).toISOString()}`);
            }
        }
    }
    console.log('\n--- END DIAGNOSTIC ---');
}

check().catch(console.error);
