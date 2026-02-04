import bcrypt from 'bcryptjs';
import { generateToken } from '../auth/jwt.js';
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserById
} from './user.service.js';

// Cadastro de usuario
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha sao obrigatorios' });
    }

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Email ja cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no registro' });
  }
};

// Login do usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha sao obrigatorios' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais invalidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais invalidas' });
    }

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no login' });
  }
};

// Retorna dados do usuario autenticado
export const me = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuario' });
  }
};

// Atualiza avatar do usuario autenticado
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Imagem nao enviada' });
    }

    const avatarUrl = `/uploads/professionals/${req.file.filename}`;
    const updated = await updateUserById(req.user.id, { avatar: avatarUrl });

    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar avatar' });
  }
};

// Rota de teste para admin
export const adminOnly = async (_req, res) => {
  res.json({ message: 'Acesso admin liberado' });
};
