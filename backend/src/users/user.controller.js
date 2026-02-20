import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { generateToken } from '../auth/jwt.js'
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserById,
  deleteUserById
} from './user.service.js'
import User from './user.model.js'

// Cadastro de usuario
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha sao obrigatorios' })
    }

    const userExists = await findUserByEmail(email)
    if (userExists) {
      return res.status(400).json({ message: 'Email ja cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      phone: phone || ''
    })

    const token = generateToken({
      id: user._id,
      role: user.role,
      email: user.email
    })

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      },
      token
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro no registro' })
  }
}

// Login do usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha sao obrigatorios' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Credenciais invalidas' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais invalidas' })
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
      email: user.email
    })

    res.json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      },
      token
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro no login' })
  }
}

// Retorna dados do usuario autenticado
export const me = async (req, res) => {
  try {
    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado' })
    }

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuario' })
  }
}

// Atualiza avatar do usuario autenticado
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Imagem nao enviada' })
    }

    const avatarUrl = `/uploads/professionals/${req.file.filename}`
    const updated = await updateUserById(req.user.id, { avatar: avatarUrl })

    res.json({ user: updated })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar avatar' })
  }
}

// Rota de teste para admin
export const adminOnly = async (_req, res) => {
  res.json({ message: 'Acesso admin liberado' })
}

// Admin cria usuario (profissional ou cliente)
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e role sao obrigatorios' })
    }

    const userExists = await findUserByEmail(email)
    if (userExists) {
      return res.status(400).json({ message: 'Email ja cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || ''
    })

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuario' })
  }
}

// Admin remove usuario
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await deleteUserById(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Usuario nao encontrado' })
    }
    res.json({ message: 'Usuario removido' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover usuario' })
  }
}

// Atualiza dados do usuario autenticado
export const updateMe = async (req, res) => {
  try {
    const { name, phone, about } = req.body
    const updates = {
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {})
    }

    if (about !== undefined) {
      if (!['admin', 'profissional'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Somente admin ou profissional pode editar o sobre' })
      }
      updates.about = about
    }

    const updated = await updateUserById(req.user.id, updates)
    res.json({ user: updated })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' })
  }
}

// Lista profissionais para exibicao publica no site cliente
export const listProfessionalsPublic = async (_req, res) => {
  try {
    const users = await User.find({ role: 'profissional' })
      .select('name avatar about phone')
      .sort({ name: 1 })
    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar profissionais' })
  }
}

// Atualiza o "sobre" de um profissional (admin ou a propria profissional)
export const updateProfessionalAbout = async (req, res) => {
  try {
    const { id } = req.params
    const { about } = req.body

    if (about === undefined) {
      return res.status(400).json({ message: 'Campo about e obrigatorio' })
    }

    if (req.user.role === 'profissional' && id !== req.user.id) {
      return res.status(403).json({ message: 'Profissional so pode editar o proprio sobre' })
    }

    const existing = await findUserById(id)
    if (!existing) {
      return res.status(404).json({ message: 'Usuario nao encontrado' })
    }

    if (existing.role !== 'profissional') {
      return res.status(400).json({ message: 'Apenas perfis profissionais podem receber sobre' })
    }

    const updated = await updateUserById(id, { about })
    res.json({ user: updated })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar sobre da profissional' })
  }
}

// Atualiza senha do usuario autenticado
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha sao obrigatorias' })
    }

    const user = await findUserByEmail(req.user.email)
    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado' })
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha atual invalida' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    res.json({ message: 'Senha atualizada com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar senha' })
  }
}

// Solicita reset de senha via email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email e obrigatorio' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(200).json({ message: 'Se existir, enviaremos o email.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    user.resetPasswordToken = tokenHash
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30)
    await user.save()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const resetUrl = `${process.env.APP_BASE_URL}/resetar-senha?token=${token}`
    const logoUrl = `${process.env.APP_BASE_URL}/Logo2.svg`

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:24px;">
        <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <div style="background:#d988b3; color:#fff; padding:20px 24px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${logoUrl}" alt="Sobrancelha Express" style="width:44px; height:44px; object-fit:contain; background:#ffffff; border-radius:10px; padding:4px;" />
              <div>
                <h2 style="margin:0; font-size:20px;">Sobrancelha Express</h2>
                <p style="margin:6px 0 0; font-size:14px;">Recuperacao de senha</p>
              </div>
            </div>
          </div>
          <div style="padding:24px; color:#333;">
            <p style="margin:0 0 12px;">Ola,</p>
            <p style="margin:0 0 16px;">Recebemos um pedido para redefinir sua senha. Clique no botao abaixo para criar uma nova senha.</p>
            <p style="margin:0 0 18px;">
              <a href="${resetUrl}" style="display:inline-block; background:#d988b3; color:#fff; text-decoration:none; padding:12px 20px; border-radius:10px; font-weight:600;">Redefinir senha</a>
            </p>
            <p style="margin:0 0 8px; font-size:13px;">Se voce nao solicitou, ignore este email.</p>
            <p style="margin:0; font-size:12px; color:#666;">Ou acesse este link: ${resetUrl}</p>
          </div>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Redefinicao de senha - Sobrancelha Express',
      text: `Para redefinir sua senha, acesse: ${resetUrl}`,
      html
    })

    res.json({ message: 'Email de recuperacao enviado.' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar email de recuperacao' })
  }
}

// Redefine senha com token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nova senha sao obrigatorios' })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+password')

    if (!user) {
      return res.status(400).json({ message: 'Token invalido ou expirado' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao redefinir senha' })
  }
}
