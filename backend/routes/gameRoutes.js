const express = require("express");
const gameController = require("../controllers/gameController");

const router = express.Router();

router.get("/stats", gameController.getStats);
router.get("/balances", gameController.getBalances);
router.post("/destroy", gameController.destroyObject);
router.post("/trade", gameController.tradeInForHash);

module.exports = router;
