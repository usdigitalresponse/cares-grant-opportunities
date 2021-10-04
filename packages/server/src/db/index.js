/* eslint-disable no-use-before-define */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
let v4;
try {
    // eslint-disable-next-line global-require
    const crypto = require('crypto');
    v4 = crypto.randomUUID;
} catch (err) {
    v4= null
}
if ( !v4 ){
    console.log('Node lacks crypto support!');
    // eslint-disable-next-line global-require
    v4 = require('uuid').v4;
}

const knex = require('./connection');
const { TABLES } = require('./constants');
const helpers = require('./helpers');

async function getUsers() {
    const users = await knex('users')
        .select(
            'users.*',
            'roles.name as role_name',
            'roles.rules as role_rules',
            'agencies.name as agency_name',
            'agencies.abbreviation as agency_abbreviation',
            'agencies.parent as agency_parent_id_id',
        )
        .leftJoin('roles', 'roles.id', 'users.role_id')
        .leftJoin('agencies', 'agencies.id', 'users.agency_id');
    return users.map((user) => {
        const u = { ...user };
        if (user.role_id) {
            u.role = {
                id: user.role_id,
                name: user.role_name,
                rules: user.role_rules,
            };
        }
        if (user.agency_id !== null) {
            u.agency = {
                id: user.agency_id,
                name: user.agency_name,
                abbreviation: user.agency_abbreviation,
                agency_parent_id: user.agency_parent_id,
            };
        }
        return u;
    });
}
function deleteUser(id) {
    return knex('users')
        .where('id', id)
        .del();
}

async function createUser(user) {
    const response = await knex
        .insert(user)
        .into('users')
        .returning(['id', 'created_at']);
    return {
        ...user,
        id: response[0].id,
        created_at: response[0].created_at,
    };
}

async function getUser(id) {
    const [user] = await knex('users')
        .select(
            'users.id',
            'users.email',
            'users.name',
            'users.role_id',
            'roles.name as role_name',
            'roles.rules as role_rules',
            'users.agency_id',
            'agencies.name as agency_name',
            'agencies.abbreviation as agency_abbreviation',
            'agencies.parent as agency_parent_id_id',
            'agencies.warning_threshold as agency_warning_threshold',
            'agencies.danger_threshold as agency_danger_threshold',
            'users.tags',
        )
        .leftJoin('roles', 'roles.id', 'users.role_id')
        .leftJoin('agencies', 'agencies.id', 'users.agency_id')
        .where('users.id', id);
    if (user.role_id != null) {
        user.role = {
            id: user.role_id,
            name: user.role_name,
            rules: user.role_rules,
        };
    }
    if (user.agency_id != null) {
        user.agency = {
            id: user.agency_id,
            name: user.agency_name,
            abbreviation: user.agency_abbreviation,
            agency_parent_id: user.agency_parent_id,
            warning_threshold: user.agency_warning_threshold,
            danger_threshold: user.agency_danger_threshold,
        };
    }
    return user;
}

async function getAgencyCriteriaForUserId(userId) {
    const user = await getUser(userId);
    const eligibilityCodes = await getAgencyEligibilityCodes(user.agency.id);
    const enabledECodes = eligibilityCodes.filter((e) => e.enabled);
    const keywords = await getAgencyKeywords(user.agency.id);

    return {
        eligibilityCodes: enabledECodes.map((c) => c.code),
        keywords: keywords.map((c) => c.search_term),
    };
}

function getRoles() {
    return knex('roles')
        .select('*')
        .orderBy('name');
}

async function getAccessToken(passcode) {
    const result = await knex('access_tokens')
        .select('*')
        .where('passcode', passcode);
    return result[0];
}

async function incrementAccessTokenUses(passcode) {
    const result = await knex('access_tokens')
        .update({ uses: knex.raw('uses + 1') })
        .where('passcode', passcode)
        .then(() => knex('access_tokens')
            .select('uses')
            .where('passcode', passcode));
    return result[0].uses;
}

function markAccessTokenUsed(passcode) {
    return knex('access_tokens')
        .where('passcode', passcode)
        .update({ used: true });
}

async function generatePasscode(email) {
    console.log('generatePasscode for :', email);
    const users = await knex('users')
        .select('*')
        .where('email', email);
    if (users.length === 0) {
        throw new Error(`User '${email}' not found`);
    }
    const passcode = v4();
    const used = false;
    const expiryMinutes = 30;
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expiryMinutes);
    await knex('access_tokens').insert({
        user_id: users[0].id,
        passcode,
        expires,
        used,
    });
    return passcode;
}

function createAccessToken(email) {
    return generatePasscode(email);
}

function getElegibilityCodes() {
    return knex(TABLES.eligibility_codes)
        .select('*');
}

function setAgencyEligibilityCodeEnabled(code, agencyId, enabled) {
    return knex(TABLES.agency_eligibility_codes)
        .where({
            agency_id: agencyId,
            code,
        })
        .update({ enabled });
}

function getKeywords() {
    return knex(TABLES.keywords)
        .select('*');
}

async function createKeyword(keyword) {
    const response = await knex
        .insert(keyword)
        .into(TABLES.keywords)
        .returning(['id', 'created_at']);
    return {
        ...keyword,
        id: response[0].id,
        created_at: response[0].created_at,
    };
}

function deleteKeyword(id) {
    return knex(TABLES.keywords)
        .where('id', id)
        .del();
}

async function getGrants({
    currentPage, perPage, filters, orderBy, searchTerm,
} = {}) {
    const { data, pagination } = await knex(TABLES.grants)
        .select(`${TABLES.grants}.*`)
        .modify((queryBuilder) => {
            if (searchTerm && searchTerm !== 'null') {
                queryBuilder.andWhere(
                    (qb) => qb.where(`${TABLES.grants}.grant_id`, '~*', searchTerm)
                        .orWhere(`${TABLES.grants}.grant_number`, '~*', searchTerm)
                        .orWhere(`${TABLES.grants}.title`, '~*', searchTerm),
                );
            }
            if (filters) {
                if (filters.interestedByUser) {
                    queryBuilder.join(TABLES.grants_interested, `${TABLES.grants}.grant_id`, `${TABLES.grants_interested}.grant_id`);
                }
                if (filters.assignedToUser) {
                    queryBuilder.join(TABLES.assigned_grants_user, `${TABLES.grants}.grant_id`, `${TABLES.assigned_grants_user}.grant_id`);
                }
                queryBuilder.andWhere(
                    (qb) => {
                        helpers.whereAgencyCriteriaMatch(qb, filters.agencyCriteria);

                        if (filters.interestedByUser) {
                            qb.where(`${TABLES.grants_interested}.user_id`, '=', filters.interestedByUser);
                        }
                        if (filters.assignedToUser) {
                            qb.where(`${TABLES.assigned_grants_user}.user_id`, '=', filters.assignedToUser);
                        }
                    },
                );
            }

            if (orderBy && orderBy !== 'undefined') {
                if (orderBy.includes('interested_agencies')) {
                    queryBuilder.leftJoin(TABLES.grants_interested, `${TABLES.grants}.grant_id`, `${TABLES.grants_interested}.grant_id`);
                    queryBuilder.distinctOn(`${TABLES.grants}.grant_id`, `${TABLES.grants_interested}.grant_id`);
                    const orderArgs = orderBy.split('|');
                    queryBuilder.orderBy(`${TABLES.grants_interested}.grant_id`, orderArgs[1]);
                    queryBuilder.orderBy(`${TABLES.grants}.grant_id`, orderArgs[1]);
                } else if (orderBy.includes('viewed_by')) {
                    const orderArgs = orderBy.split('|');
                    queryBuilder.leftJoin(TABLES.grants_viewed, `${TABLES.grants}.grant_id`, `${TABLES.grants_viewed}.grant_id`);
                    queryBuilder.distinctOn(`${TABLES.grants}.grant_id`, `${TABLES.grants_viewed}.grant_id`);
                    queryBuilder.orderBy(`${TABLES.grants_viewed}.grant_id`, orderArgs[1]);
                    queryBuilder.orderBy(`${TABLES.grants}.grant_id`, orderArgs[1]);
                } else {
                    const orderArgs = orderBy.split('|');
                    queryBuilder.orderBy(...orderArgs);
                }
            }
        })
        .paginate({ currentPage, perPage, isLengthAware: true });

    const viewedBy = await knex(TABLES.agencies)
        .join(TABLES.grants_viewed, `${TABLES.agencies}.id`, '=', `${TABLES.grants_viewed}.agency_id`)
        .whereIn('grant_id', data.map((grant) => grant.grant_id))
        .select(`${TABLES.grants_viewed}.grant_id`, `${TABLES.grants_viewed}.agency_id`, `${TABLES.agencies}.name as agency_name`, `${TABLES.agencies}.abbreviation as agency_abbreviation`);
    const interestedBy = await getInterestedAgencies({ grantIds: data.map((grant) => grant.grant_id) });

    const dataWithAgency = data.map((grant) => {
        const viewedByAgencies = viewedBy.filter((viewed) => viewed.grant_id === grant.grant_id);
        const agenciesInterested = interestedBy.filter((intested) => intested.grant_id === grant.grant_id);
        return {
            ...grant,
            viewed_by_agencies: viewedByAgencies,
            interested_agencies: agenciesInterested,
        };
    });
    return { data: dataWithAgency, pagination };
}

async function getGrant({ grantId }) {
    const results = await knex.table(TABLES.grants)
        .select('*')
        .where({ grant_id: grantId });
    return results[0];
}

async function getTotalGrants({ agencyCriteria, createdTsBounds, updatedTsBounds } = {}) {
    const rows = await knex(TABLES.grants)
        .modify(helpers.whereAgencyCriteriaMatch, agencyCriteria)
        .modify((qb) => {
            if (createdTsBounds && createdTsBounds.fromTs) {
                qb.where('created_at', '>=', createdTsBounds.fromTs);
            }
            if (updatedTsBounds && updatedTsBounds.fromTs) {
                qb.where('updated_at', '>=', updatedTsBounds.fromTs);
            }
        })
        .count();
    return rows[0].count;
}

async function getTotalViewedGrants() {
    const rows = await knex(TABLES.grants_viewed).count();
    return rows[0].count;
}

async function getTotalInterestedGrants() {
    const rows = await knex(TABLES.grants_interested).count();
    return rows[0].count;
}

async function getTotalInterestedGrantsByAgencies() {
    const rows = await knex(TABLES.grants_interested)
        .select(`${TABLES.grants_interested}.agency_id`, `${TABLES.agencies}.name`, `${TABLES.agencies}.abbreviation`,
            knex.raw('SUM(CASE WHEN is_rejection = TRUE THEN 1 ELSE 0 END) rejections'),
            knex.raw('SUM(CASE WHEN is_rejection = FALSE THEN 1 ELSE 0 END) interested'))
        .join(TABLES.agencies, `${TABLES.grants_interested}.agency_id`, `${TABLES.agencies}.id`)
        .join(TABLES.interested_codes, `${TABLES.grants_interested}.interested_code_id`, `${TABLES.interested_codes}.id`)
        .count(`${TABLES.interested_codes}.is_rejection`)
        .groupBy(`${TABLES.grants_interested}.agency_id`, `${TABLES.agencies}.name`, `${TABLES.agencies}.abbreviation`);
    return rows;
}

function markGrantAsViewed({ grantId, agencyId, userId }) {
    return knex(TABLES.grants_viewed)
        .insert({ agency_id: agencyId, grant_id: grantId, user_id: userId });
}

function getGrantAssignedUsers({ grantId }) {
    return knex(TABLES.assigned_grants_user)
        .join(TABLES.users, `${TABLES.users}.id`, '=', `${TABLES.assigned_grants_user}.user_id`)
        .where({ grant_id: grantId });
}

function assignGrantsToUsers({ grantId, userIds, userId }) {
    const insertPayload = userIds.map((uId) => ({
        user_id: uId,
        grant_id: grantId,
        assigned_by: userId,
    }));
    return knex(TABLES.assigned_grants_user)
        .insert(insertPayload)
        .onConflict(['user_id', 'grant_id'])
        .ignore();
}

function unassignUsersToGrant({ grantId, userIds }) {
    const deleteWhere = userIds.map((uId) => ([uId, grantId]));
    return knex(TABLES.assigned_grants_user)
        .whereIn(['user_id', 'grant_id'], deleteWhere)
        .delete();
}

function getInterestedAgencies({ grantIds }) {
    return knex(TABLES.agencies)
        .join(TABLES.grants_interested, `${TABLES.agencies}.id`, '=', `${TABLES.grants_interested}.agency_id`)
        .join(TABLES.users, `${TABLES.users}.id`, '=', `${TABLES.grants_interested}.user_id`)
        .leftJoin(TABLES.interested_codes, `${TABLES.interested_codes}.id`, '=', `${TABLES.grants_interested}.interested_code_id`)
        .whereIn('grant_id', grantIds)
        .select(`${TABLES.grants_interested}.grant_id`, `${TABLES.grants_interested}.agency_id`,
            `${TABLES.agencies}.name as agency_name`, `${TABLES.agencies}.abbreviation as agency_abbreviation`,
            `${TABLES.users}.id as user_id`, `${TABLES.users}.email as user_email`, `${TABLES.users}.name as user_name`,
            `${TABLES.interested_codes}.id as interested_code_id`, `${TABLES.interested_codes}.name as interested_code_name`, `${TABLES.interested_codes}.is_rejection as interested_is_rejection`);
}

function markGrantAsInterested({
    grantId, agencyId, userId, interestedCode,
}) {
    return knex(TABLES.grants_interested)
        .insert({
            agency_id: agencyId,
            grant_id: grantId,
            user_id: userId,
            interested_code_id: interestedCode,
        });
}

function getInterestedCodes() {
    return knex(TABLES.interested_codes)
        .select('*')
        .orderBy('name');
}

function getAgencies() {
    return knex(TABLES.agencies)
        .select('*')
        .orderBy('name');
}

function getAgencyEligibilityCodes(agencyId) {
    return knex(TABLES.agencies)
        .join(TABLES.agency_eligibility_codes, `${TABLES.agencies}.id`, '=', `${TABLES.agency_eligibility_codes}.agency_id`)
        .join(TABLES.eligibility_codes, `${TABLES.eligibility_codes}.code`, '=', `${TABLES.agency_eligibility_codes}.code`)
        .select('eligibility_codes.code', 'eligibility_codes.label', 'agency_eligibility_codes.enabled',
            'agency_eligibility_codes.created_at', 'agency_eligibility_codes.updated_at')
        .where('agencies.id', agencyId)
        .orderBy('code');
}

function getAgencyKeywords(agencyId) {
    return knex(TABLES.keywords)
        .select('*')
        .where('agency_id', agencyId);
}

function setAgencyThresholds(id, warning_threshold, danger_threshold) {
    return knex(TABLES.agencies)
        .where({
            id,
        })
        .update({ warning_threshold, danger_threshold });
}

async function createRecord(tableName, row) {
    return knex(tableName).insert(row);
}

async function updateRecord(tableName, syncKey, key, row) {
    return knex(tableName)
        .where({ [syncKey]: key })
        .update({
            ...row,
            updated_at: new Date(),
        });
}

async function getAllRows(tableName, syncKey, fetchCols) {
    const fields = fetchCols.slice(0);
    fields.push(syncKey);

    const rows = {};
    const records = await knex.select('*').from(tableName);
    records.forEach((record) => {
        rows[record[syncKey]] = record;
    });
    return rows;
}

async function sync(tableName, syncKey, updateCols, newRows) {
    const oldRows = await getAllRows(tableName, syncKey, updateCols);
    const alreadyUpdated = {};
    for (const i in newRows) {
        const newRow = newRows[i];
        const syncKeyValue = newRow[syncKey];
        if (alreadyUpdated[syncKeyValue]) {
            // already creating an item with this syncKey; do nothing
        } else if (oldRows[syncKeyValue]) {
            // already inserted, check if updates are necessary
            alreadyUpdated[syncKeyValue] = true;

            const updatedFields = {};
            updateCols.forEach((col) => {
                if (oldRows[syncKeyValue][col] !== newRow[col]) {
                    updatedFields[col] = newRow[col];
                }
            });

            if (Object.values(updatedFields).length > 0) {
                try {
                    await updateRecord(tableName, syncKey, oldRows[syncKeyValue][syncKey], updatedFields);
                    console.log(`updated ${oldRows[syncKeyValue][syncKey]} in ${tableName}`);
                } catch (err) {
                    console.error(`knex error when updating ${oldRows[syncKeyValue][syncKey]} with ${JSON.stringify(updatedFields)}: ${err}`);
                }
            }
        } else {
            // does not exist, insert!
            alreadyUpdated[syncKeyValue] = true;
            try {
                await createRecord(tableName, newRow);
                console.log(`created ${newRow[syncKey]} in ${tableName}`);
            } catch (err) {
                console.error(`knex error when creating a new row with key ${newRow[syncKey]}`);
            }
        }
    }
}

function close() {
    return knex.destroy();
}

module.exports = {
    getUsers,
    createUser,
    deleteUser,
    getUser,
    getAgencyCriteriaForUserId,
    getRoles,
    createAccessToken,
    getAccessToken,
    incrementAccessTokenUses,
    markAccessTokenUsed,
    getAgencies,
    getAgencyEligibilityCodes,
    setAgencyEligibilityCodeEnabled,
    getKeywords,
    getAgencyKeywords,
    setAgencyThresholds,
    createKeyword,
    deleteKeyword,
    getGrants,
    getGrant,
    getTotalGrants,
    getTotalViewedGrants,
    getTotalInterestedGrants,
    getTotalInterestedGrantsByAgencies,
    markGrantAsViewed,
    getInterestedAgencies,
    getInterestedCodes,
    markGrantAsInterested,
    getGrantAssignedUsers,
    assignGrantsToUsers,
    unassignUsersToGrant,
    getElegibilityCodes,
    sync,
    getAllRows,
    close,
};
