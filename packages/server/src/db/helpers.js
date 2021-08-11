function whereFiltersMatch(qb, filters) {
    if (filters?.eligibilityCodes) {
        qb.where('eligibility_codes', '~', filters.eligibilityCodes.join('|'));
    }

    if (filters?.keywords) {
        qb.where('description', '~*', filters.keywords.join('|'));
    }
}

module.exports = {
    whereFiltersMatch,
}