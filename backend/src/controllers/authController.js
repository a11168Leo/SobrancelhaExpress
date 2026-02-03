const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        message: error.message || 'Erro ao autenticar'
      });
    }
  }

  async register(req, res) {
    try {
      const user = await authService.register(req.body);

      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({
        message: error.message || 'Erro ao registrar'
      });
    }
  }
}

module.exports = new AuthController();
