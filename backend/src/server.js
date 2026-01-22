const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ROTAS
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/services", require("./routes/service.routes"));
app.use("/api/clients", require("./routes/client.routes.js"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/finance", require("./routes/finance.routes"));
app.use("/api/professional", require("./routes/professional.routes"));

app.get("/", (req, res) => {
  res.send("API Sobrancelha Express rodando 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
