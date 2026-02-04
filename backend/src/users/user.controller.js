import bcrypt from 'bcryptjs';
import { generateToken } from '../auth/jwt.js';
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserById,
  deleteUserById
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
      role: user.role,
      email: user.email
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
      role: user.role,
      email: user.email
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

// Admin cria usuario (profissional ou cliente)
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e role são obrigatórios' });
    }

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || ''
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

// Admin remove usuario
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteUserById(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário removido' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover usuário' });
  }
};

// Atualiza dados do usuário autenticado
export const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = await updateUserById(req.user.id, {
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {})
    });
    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

// Atualiza senha do usuário autenticado
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha atual inválida' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar senha' });
  }
};
