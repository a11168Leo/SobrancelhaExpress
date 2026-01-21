const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointmentController");

router.post("/", controller.createAppointment);
router.get("/:professionalId", controller.getAppointments);

module.exports = router;
