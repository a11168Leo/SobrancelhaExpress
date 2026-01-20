const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Rota teste: apenas profissionais logados podem acessar
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("professional"),
  (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.name}. Você é profissional!` });
  }
);

module.exports = router;
