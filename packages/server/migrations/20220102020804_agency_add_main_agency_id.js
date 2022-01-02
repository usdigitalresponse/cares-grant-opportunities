/* eslint-disable func-names */
exports.up = function (knex) {
    return knex.schema
        .table('agencies', (table) => {
            table.integer('main_agency_id').unsigned();

            table.foreign('main_agency_id').references('agencies.id');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('agencies', (table) => {
            table.dropColumn('main_agency_id');
        });
};
