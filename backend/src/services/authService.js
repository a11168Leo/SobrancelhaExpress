class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Simulação temporária
    return {
      message: 'Login realizado com sucesso',
      user: {
        email
      },
      token: 'fake-jwt-token'
    };
  }

  async register(data) {
    if (!data.email || !data.password) {
      throw new Error('Dados inválidos');
    }

    return {
      message: 'Usuário registrado com sucesso',
      user: {
        email: data.email
      }
    };
  }
}

module.exports = new AuthService();
