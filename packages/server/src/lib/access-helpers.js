const { getUser } = require('../db');

function isPartOfAgency(agencies, agencyId) {
    return agencies.find((s) => s.id === Number(agencyId));
}

/**
 * Determine if a user is authorized for an agency.
 *
 * @param {Number} userId
 * @param {Number} agencyId
 * @returns {Boolean} true if the agency is the user's or a descendant; false otherwise
 */
async function isAuthorized(userId, agencyId) {
    const user = await getUser(userId);
    return isPartOfAgency(user.agency.subagencies, agencyId);
}

async function requireAdminUser(req, res, next) {
    if (!req.signedCookies.userId) {
        res.sendStatus(403);
        return;
    }

    const user = await getUser(req.signedCookies.userId);
    if (user.role_name !== 'admin') {
        res.sendStatus(403);
        return;
    }

    // Depending on the request, an agency ID may be specified in zero or one of:
    //  a header: angecy-id
    //  a query string: ?agency=...
    //  a route parameter :agency
    //  a route parameter :agencyId
    //  a body field named 'agency'
    const headerAgency = Number(req.headers['agency-id']);
    const queryAgency = Number(req.query.agency);
    const paramAgency = Number(req.params.agency);
    const paramAgencyId = Number(req.params.agencyId);
    const bodyAgency = Number(req.body.agency);

    const requestAgency = bodyAgency || paramAgency || paramAgencyId || queryAgency || headerAgency;

    if (requestAgency !== null || requestAgency !== undefined) {
        const authorized = await isAuthorized(req.signedCookies.userId, requestAgency);
        if (!authorized) {
            res.sendStatus(403);
            return;
        }
        req.session = { ...req.session, user, selectedAgency: requestAgency };
    } else {
        req.session = { ...req.session, user, selectedAgency: user.agency_id };
    }

    next();
}

async function requireUser(req, res, next) {
    if (!req.signedCookies.userId) {
        res.sendStatus(403);
        return;
    }

    const user = await getUser(req.signedCookies.userId);
    if (req.query.agency && user.role_name === 'staff') {
        res.sendStatus(403); // Staff are restricted to their own agency.
        return;
    }

    // User NOT required to be admin; but if they ARE, they must satisfy admin rules.
    if (user.role_name === 'admin') {
        await requireAdminUser(req, res, next);
        return;
    }

    req.session = { ...req.session, user, selectedAgency: user.agency_id };

    next();
}

module.exports = {
    requireAdminUser, requireUser, isAuthorized, isPartOfAgency,
};
