const { agencies } = require('./agencies');

exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('keywords').del()
        .then(() => knex('keywords').insert([
            {
                id: 1, mode: 'autoinsert ALL keywords matches', search_term: 'Covid', notes: '', agency_id: agencies[0].id,
            },
            {
                id: 2, mode: 'autoinsert ALL keywords matches', search_term: 'coronavirus', notes: '', agency_id: agencies[0].id,
            },
            {
                id: 3, mode: 'autoinsert ALL keywords matches', search_term: '"Cares Act"', notes: '', agency_id: agencies[0].id,
            },
            {
                id: 4, mode: 'autoinsert ALL keywords matches', search_term: 'COVID-19', notes: '', agency_id: agencies[0].id,
            },
            {
                id: 5, mode: 'autoinsert ALL keywords matches', search_term: 'SARS-CoV-2', notes: '', agency_id: agencies[0].id,
            },
            {
                id: 6, mode: 'autoinsert ALL keywords matches', search_term: '"Coronavirus 2"', notes: '', agency_id: agencies[0].id,
            },
            {
                id: 7, mode: 'autoinsert ALL keywords matches', search_term: '"(CARES) Act"', notes: '', agency_id: agencies[0].id,
            },
        ]));
};
