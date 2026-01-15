import { config } from '../config';

async function testLogin() {
    const email = 'pendamping1@example.com';
    const password = 'pendamping1';

    console.log(`Attempting login for ${email} with password '${password}'...`);
    console.log(`Auth URL: ${config.auth.url}/api/auth/sign-in/email`);

    try {
        const response = await fetch(`${config.auth.url}/api/auth/sign-in/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testLogin();
