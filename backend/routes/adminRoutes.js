const express = require("express");

const adminController = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/authenticateAdmin");

const router = express.Router();

router.get("/overview", authenticateAdmin, adminController.getOverview);

module.exports = router;

