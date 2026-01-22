const User = require("../models/User");
const Professional = require("../models/Professional");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Usuário já existe" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Se for profissional, cria Professional
    let professional = null;
    if (role === "professional") {
      professional = await Professional.create({ user: user._id });
    }

    res.status(201).json({
      message: "Usuário criado com sucesso",
      userId: user._id,
      professionalId: professional?._id || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Credenciais inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const professional = await Professional.findOne({ user: user._id });

    res.json({
      token,
      role: user.role,
      name: user.name,
      professionalId: professional?._id || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
