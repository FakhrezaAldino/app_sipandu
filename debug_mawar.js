
const { db } = require('./apps/pkh-backend/src/db');
const { kelompok, kpm, permasalahan } = require('./apps/pkh-backend/src/db/schema');
const { eq, and, inArray } = require('drizzle-orm');

async function check() {
    console.log('--- DEBUG MAWAR ---');
    const ks = await db.query.kelompok.findMany({
        where: (k, { ilike }) => ilike(k.namaKelompok, '%Mawar%')
    });

    for (const k of ks) {
        console.log(`Kelompok: ${k.namaKelompok} (${k.id})`);
        const kpms = await db.query.kpm.findMany({
            where: (kp, { eq }) => eq(kp.kelompokId, k.id)
        });
        console.log(`KPMs (${kpms.length}):`, JSON.stringify(kpms.map(kp => ({ id: kp.id, nama: kp.namaLengkap, isActive: kp.isActive })), null, 2));

        const kpmIds = kpms.map(kp => kp.id);
        if (kpmIds.length > 0) {
            const probs = await db.query.permasalahan.findMany({
                where: (p, { inArray }) => inArray(p.kpmId, kpmIds)
            });
            console.log(`Problems found for KPMs in ${k.namaKelompok}:`, JSON.stringify(probs, null, 2));
        } else {
            console.log('No KPMs found for this kelompok.');
        }
    }
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
