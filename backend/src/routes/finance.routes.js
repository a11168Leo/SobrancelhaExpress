const express = require("express");
const router = express.Router();
const controller = require("../controllers/financeController");

router.get("/:professionalId", controller.getDashboardFinance);

module.exports = router;
