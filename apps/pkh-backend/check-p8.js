import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function check() {
    console.log('--- Checking Pendamping User: pendamping8@example.com ---');
    const result = await sql`
        SELECT u.id, u.email, u.role, p.wilayah_binaan 
        FROM users u 
        LEFT JOIN pendampings p ON u.id = p.user_id 
        WHERE u.email = 'pendamping8@example.com'
    `;

    if (result.length === 0) {
        console.log('User pendamping8@example.com NOT FOUND!');
    } else {
        console.log('User found:', JSON.stringify(result[0], null, 2));
    }

    await sql.end();
}

check().catch(console.error);
