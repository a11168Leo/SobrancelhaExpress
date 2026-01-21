const express = require("express");
const router = express.Router();
const controller = require("../controllers/serviceController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.post("/", auth, role("professional"), controller.createService);
router.get("/:professionalId", auth, controller.getServices);

module.exports = router;
