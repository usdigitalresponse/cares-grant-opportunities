const express = require('express');

const router = express.Router();
const { requireAdminUser } = require('../lib/access-helpers');
const { getAgencies, setAgencyThresholds } = require('../db');

router.get('/', async (req, res) => {
    const response = await getAgencies();
    res.json(response);
});

router.put('/:id/thresholds', requireAdminUser, async (req, res) => {
    const { id } = req.params;
    const { warningThreshold, dangerThreshold } = req.body;
    const result = await setAgencyThresholds(id, warningThreshold, dangerThreshold);
    res.json(result);
});

module.exports = router;
