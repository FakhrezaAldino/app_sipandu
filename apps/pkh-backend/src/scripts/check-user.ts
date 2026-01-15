import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'pendamping1@example.com';
    console.log(`Checking for user: ${email}...`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (user) {
        console.log('User FOUND:', user);
    } else {
        console.log('User NOT FOUND.');
    }
    process.exit(0);
}

main();
