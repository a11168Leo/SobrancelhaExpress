const express = require("express");
const router = express.Router();
const controller = require("../controllers/clientController");

router.post("/", controller.createClient);
router.get("/:professionalId", controller.getClients);

module.exports = router;
