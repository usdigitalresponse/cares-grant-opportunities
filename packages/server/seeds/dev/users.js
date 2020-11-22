require('dotenv').config();

const { agencies } = require('./agencies');
const { roles } = require('./roles');

// const adminList = (process.env.INITIAL_ADMIN_EMAILS || '').split(/\s*,\s*/).filter((s) => s);
// const agencyUserList = (process.env.INITIAL_AGENCY_EMAILS || '').split(
//     /\s*,\s*/,
// ).filter((s) => s);

const adminList = [
    {
        email: 'rafael.pol+admin@protonmail.com',
        name: 'rafa1',
        agency_id: agencies[0].id,
        role_id: roles[0].id,
    },
];
const agencyUserList = [
    {
        email: 'rafael.pol+staff@protonmail.com',
        name: 'rafa2',
        agency_id: agencies[1].id,
        role_id: roles[1].id,
    },
];

exports.seed = async function (knex) {
    // Deletes ALL existing admins
    await knex('users')
        .where({ role_id: roles[0].id })
        .del();
    await knex('users').insert(adminList);
    await knex('users')
        .where({ role_id: roles[1].id })
        .del();
    await knex('users').insert(agencyUserList);
};
