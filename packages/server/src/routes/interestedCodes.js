const express = require('express');

const router = express.Router({ mergeParams: true });
const db = require('../db');

router.get('/', async (req, res) => {
    const interestedCodes = await db.getInterestedCodes();
    res.json(interestedCodes);
});

module.exports = router;
