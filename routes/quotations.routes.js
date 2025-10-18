const express = require("express");
const router = express.Router();
const quotationsController = require("../controllers/quotations.controller");
const { authenticateToken } = require("../middlewares/auth");

router.post("/", authenticateToken, quotationsController.generateQuotation);

module.exports = router;
