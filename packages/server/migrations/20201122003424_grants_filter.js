exports.up = function (knex) {
    return knex.schema
        .table('grants', (table) => {
            table.text('description');
            table.string('eligibility_codes');
            table.text('raw_body');
        })
        .table('eligibility_codes', (table) => {
            table.integer('agency_id').unsigned();

            table.foreign('agency_id').references('agencies.id');
        })
        .table('keywords', (table) => {
            table.integer('agency_id').unsigned();

            table.foreign('agency_id').references('agencies.id');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('grants', (table) => {
            table.dropColumn('description');
            table.dropColumn('eligibility_codes');
            table.dropColumn('raw_body');
        })
        .table('eligibility_codes', (table) => {
            table.dropColumn('agency_id');
        })
        .table('keywords', (table) => {
            table.dropColumn('agency_id');
        });
};
