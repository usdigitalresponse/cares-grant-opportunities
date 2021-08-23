const { expect } = require('chai');
const db = require('../../src/db');
const knex = require('../../src/db/connection');
const { TABLES } = require('../../src/db/constants');
const fixtures = require('./seeds/fixtures');

after(() => {
    knex.destroy();
});

describe('db', () => {
    context('getTotalGrants', () => {
        it('gets total grant count with no parameters', async () => {
            const result = await db.getTotalGrants();
            expect(result).to.equal('3');
        });

        it('gets total grant count matching agency criteria', async () => {
            const agencyCriteria = {
                eligibilityCodes: ['11'],
                keywords: ['Covid'],
            };
            const result = await db.getTotalGrants({ agencyCriteria });

            expect(result).to.equal('1');
        });

        it('gets total grant count matching eligibilityCodes only', async () => {
            const agencyCriteria = {
                eligibilityCodes: ['25'],
            };
            const result = await db.getTotalGrants({ agencyCriteria });

            expect(result).to.equal('2');
        });

        it('gets total grant count matching keywords only', async () => {
            const agencyCriteria = {
                keywords: ['earth sciences'],
            };
            const result = await db.getTotalGrants({ agencyCriteria });

            expect(result).to.equal('1');
        });
    });

    context('getAgencyCriteriaForUserId', () => {
        it('gets agency criteria associated with a userId', async () => {
            const staffUserId = await knex(TABLES.users).select('id').where('email', fixtures.users.staffUser.email);

            const result = await db.getAgencyCriteriaForUserId(staffUserId[0].id);

            expect(result).to.have.property('eligibilityCodes').with.lengthOf(1);
            expect(result.eligibilityCodes[0]).to.equal(fixtures.agencyEligibilityCodes.accountancyNative.code);
            expect(result).to.have.property('keywords').with.lengthOf(1);
            expect(result.keywords[0]).to.equal(fixtures.keywords.accountancyCovid.search_term);
        });
    });

    context('setAgencyThresholds', () => {
        it('stores warning and danger thresholds for an agency', async () => {
            const expected = {
                id: fixtures.agencies.accountancy.id,
                warning_threshold: 1,
                danger_threshold: 2,
            };

            const result = await db.setAgencyThresholds(expected.id, expected.warning_threshold, expected.danger_threshold);
            expect(result).to.be.an('array').with.lengthOf(1);
            expect(result[0]).to.deep.include(expected);
        });
    });

    context('getGrantActivity', () => {
        it('gets views, interest, and assignments for a grant', async () => {
            const expectedView = {
                name: fixtures.users.adminUser.name,
                description: 'Viewed',
                elapsed_days: 0,
            };

            const expectedInterest = {
                name: fixtures.users.staffUser.name,
                description: 'Interested: Not applicable to needs/goals',
                elapsed_days: 0,
            };

            const result = await db.getGrantActivity({ grantId: fixtures.grants.earFellowship.grant_id });
            expect(result).to.be.an('array').with.lengthOf(2);
            expect(result[0]).to.deep.include(expectedView);
            expect(result[1]).to.deep.include(expectedInterest);
        });
    });
});
