/* ======================================== */
/* ARQUIVO: BACKEND/SRC/TEAM/TEAM.CONTROLLER.JS */
/* ======================================== */

// Importacoes
import { listUsers } from '../users/user.service.js';

// Funcao exportada: listByRole
export const listByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await listUsers({ role });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar usuarios' });
  }
};

// Funcao exportada: listProfessionals
export const listProfessionals = async (_req, res) => {
  try {
    const users = await listUsers({ role: 'profissional' });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar profissionais' });
  }
};

// Funcao exportada: listClients
export const listClients = async (_req, res) => {
  try {
    const users = await listUsers({ role: 'cliente' });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar clientes' });
  }
};

