const express = require('express');

const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const result = {};
    if (req.query.totalGrants) {
        result.totalGrants = await db.getTotalGrants();
    }
    if (req.query.totalViewedGrants) {
        result.totalViewedGrants = await db.getTotalViewedGrants();
    }
    if (req.query.totalInterestedGrants) {
        result.totalInterestedGrants = await db.getTotalInteresedGrants();
    }
    res.json(result);
});

module.exports = router;
