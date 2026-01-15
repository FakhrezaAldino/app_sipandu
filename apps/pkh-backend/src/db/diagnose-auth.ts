import { db } from './index';
import { users, accounts } from './schema';
import { eq } from 'drizzle-orm';

async function diagnose() {
    const email = 'pendamping5@gmail.com';
    console.log('--- Diagnosis for', email, '---');

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.log('User not found!');
    } else {
        console.log('User Record:', JSON.stringify(user, null, 2));

        const accountRecords = await db.query.accounts.findMany({
            where: eq(accounts.userId, user.id)
        });
        console.log('Account Records:', JSON.stringify(accountRecords, null, 2));
    }

    // Check admin record too
    const admin = await db.query.users.findFirst({
        where: eq(users.email, 'admin@pkh.go.id')
    });
    console.log('Admin Record Role:', admin?.role);

    process.exit(0);
}

diagnose().catch(err => {
    console.error(err);
    process.exit(1);
});
