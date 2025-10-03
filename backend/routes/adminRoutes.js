const express = require('express');

const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/overview', adminController.getOverview);
router.get('/overview/html', adminController.renderOverviewPage);

module.exports = router;
