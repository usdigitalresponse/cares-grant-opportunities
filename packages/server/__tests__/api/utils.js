const fetch = require('node-fetch');

require('dotenv').config();

const knex = require('knex')({
    client: 'pg',
    connection: process.env.POSTGRES_TEST_URL,
});

async function getSessionCookie(email) {
    // POSTing an email address generates a passcode.
    await fetch(`${process.env.API_DOMAIN}/api/sessions`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
    });

    // Get the new passcode directly from PostgresQL.
    const query = `SELECT created_at, passcode
              FROM access_tokens
              ORDER BY created_at DESC
              LIMIT 1
            ;`;
    const result = await knex.raw(query);
    const { passcode } = result.rows[0];

    // Use the passcode to generate a sessionID ...
    const response = await fetch(`${process.env.API_DOMAIN}/api/sessions/?passcode=${passcode}`, { redirect: 'manual' });
    // ... and the resulting cookie can be used to authorize requests.
    return response.headers.raw()['set-cookie'];
}

module.exports = {
    getSessionCookie,
};
