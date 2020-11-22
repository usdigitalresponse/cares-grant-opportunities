const roles = [
    { id: 1, name: 'admin', rules: {} },
    { id: 2, name: 'staff', rules: {} },
];

exports.roles = roles;

exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('roles')
        .del()
        .then(() => knex('roles').insert(roles));
};
