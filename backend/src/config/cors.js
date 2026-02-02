const corsOptions = {
  origin: [
    "http://localhost:3000", // Site do Cliente
    "http://localhost:3001"  // Site do Profissional
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

module.exports = corsOptions;