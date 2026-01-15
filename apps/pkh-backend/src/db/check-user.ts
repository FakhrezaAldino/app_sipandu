import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function checkUser() {
    const email = 'pendamping5@example.com';
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User not found with email:', email);
        // List all users to see what we have
        const allUsers = await db.query.users.findMany({
            limit: 10
        });
        console.log('Last 10 users:', JSON.stringify(allUsers.map(u => ({ email: u.email, role: u.role })), null, 2));
    }
    process.exit(0);
}

checkUser().catch(err => {
    console.error(err);
    process.exit(1);
});
