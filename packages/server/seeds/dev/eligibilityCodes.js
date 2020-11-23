const { agencies } = require('./agencies');

exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('eligibility_codes').del()
        .then(() => knex('eligibility_codes').insert([
            {
                code: '11', enabled: false, agency_id: agencies[0].id, label: 'Native American tribal organizations (other than Federally recognized tribal governments)',
            },
            {
                code: '20', enabled: false, agency_id: agencies[0].id, label: 'Private institutions of higher education',
            },
            {
                code: '12', enabled: false, agency_id: agencies[0].id, label: 'Nonprofits having a 501(c)(3) status with the IRS, other than institutions of higher education',
            },
            {
                code: '13', enabled: false, agency_id: agencies[0].id, label: 'Nonprofits that do not have a 501(c)(3) status with the IRS, other than institutions of higher education',
            },
            {
                code: '21', enabled: false, agency_id: agencies[0].id, label: 'Individuals',
            },
            {
                code: '22', enabled: false, agency_id: agencies[0].id, label: 'For profit organizations other than small businesses',
            },
            {
                code: '23', enabled: false, agency_id: agencies[0].id, label: 'Small businesses',
            },
            {
                code: '02', enabled: false, agency_id: agencies[0].id, label: 'City or township governments',
            },
            {
                code: '01', enabled: false, agency_id: agencies[0].id, label: 'County governments',
            },
            {
                code: '05', enabled: false, agency_id: agencies[0].id, label: 'Independent school districts',
            },
            {
                code: '08', enabled: false, agency_id: agencies[0].id, label: 'Public housing authorities / Indian housing authorities',
            },
            {
                code: '04', enabled: false, agency_id: agencies[0].id, label: 'Special district governments',
            },
            {
                code: '25', enabled: false, agency_id: agencies[0].id, label: 'Others(see text field entitled "Additional Information on Eligibility" for clarification)',
            },
            {
                code: '99', enabled: false, agency_id: agencies[0].id, label: 'Unrestricted(i.e., open to any type of entity above), subject to any clarification in text field entitled "Additional Information on Eligibility"',
            },
            {
                code: '07', enabled: false, agency_id: agencies[0].id, label: 'Native American tribal governments(Federally recognized)',
            },
            {
                code: '06', enabled: false, agency_id: agencies[0].id, label: 'Public and State controlled institutions of higher education',
            },
            {
                code: '00', enabled: false, agency_id: agencies[0].id, label: 'State governments',
            },
        ]));
};
