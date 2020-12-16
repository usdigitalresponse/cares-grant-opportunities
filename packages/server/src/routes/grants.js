const express = require('express');

const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const user = await db.getUser(req.signedCookies.userId);
    const eligibilityCodes = await db.getAgencyEligibilityCodes(user.agency.id);
    const keywords = await db.getAgencyKeywords(user.agency.id);
    console.log({ user });
    console.log({ eligibilityCodes, keywords });
    const grants = await db.getGrants({
        ...req.query,
        filters: {
            eligibilityCodes: eligibilityCodes.map((c) => c.code),
            keywords: keywords.map((c) => c.search_term),
        },
    });
    res.json(grants);
});

router.put('/:grantId/view/:agencyId', async (req, res) => {
    const user = await db.getUser(req.signedCookies.userId);
    const { agencyId, grantId } = req.params;
    await db.markGrantAsViewed({ grantId, agencyId, userId: user.id });
    res.json({});
});

router.put('/:grantId/interested/:agencyId', async (req, res) => {
    const user = await db.getUser(req.signedCookies.userId);
    const { agencyId, grantId } = req.params;
    await db.markGrantAsInterested({ grantId, agencyId, userId: user.id });
    res.json({});
});

module.exports = router;
