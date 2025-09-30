const express = require("express");
const router = express.Router();

// Temporary placeholder route
router.post("/", (req, res) => {
  res.json({ message: "Destroy route works!" });
});

module.exports = router;
