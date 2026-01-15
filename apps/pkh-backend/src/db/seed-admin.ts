import { db } from './index';
import { users, accounts } from './schema/auth';
import { eq } from 'drizzle-orm';
import { auth } from '../lib/auth';

async function main() {
    const adminEmail = 'admin@pkh.go.id';
    const adminName = 'Administrator';
    const adminPassword = 'Admin123!';

    console.log('--- Starting Admin Seed (via Better Auth API) ---');

    try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, adminEmail),
        });

        if (existingUser) {
            console.log(`User ${adminEmail} exists. Deleting to re-create with fresh credentials...`);
            // Delete existing user and their accounts (cascade will handle it)
            await db.delete(users).where(eq(users.id, existingUser.id));
            console.log('Deleted existing user.');
        }

        console.log(`Creating fresh admin user: ${adminEmail}...`);

        // Use Better Auth API to sign up the user
        // This ensures correct password hashing and linking
        const user = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: adminName,
            }
        });

        if (!user) {
            throw new Error('Failed to create user via Better Auth API');
        }

        // Ensure the role is set to admin (Better Auth API might set it to default 'pendamping')
        await db.update(users)
            .set({ role: 'admin', emailVerified: true })
            .where(eq(users.email, adminEmail));

        console.log('--- Admin Seed Completed Successfully ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

    } catch (error) {
        console.error('--- Admin Seed Error ---');
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

main();
