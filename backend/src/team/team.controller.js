import { listUsers } from '../users/user.service.js';

// Lista usuarios por papel (admin)
export const listByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await listUsers({ role });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar usuarios' });
  }
};

// Lista todos os profissionais (admin)
export const listProfessionals = async (_req, res) => {
  try {
    const users = await listUsers({ role: 'profissional' });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar profissionais' });
  }
};

// Lista todos os clientes (admin)
export const listClients = async (_req, res) => {
  try {
    const users = await listUsers({ role: 'cliente' });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar clientes' });
  }
};
