import {
  createService,
  findServiceById,
  listServices,
  updateService,
  deleteService
} from './service.service.js';
import { findCategoryById } from '../categories/category.service.js';

// Valida se o nivel da categoria esta correto
const validateCategoryLevel = async (categoryId, expectedLevel) => {
  if (!categoryId && categoryId !== null) {
    return null;
  }
  if (!categoryId) {
    return null;
  }
  const category = await findCategoryById(categoryId);
  if (!category) {
    return { error: 'Categoria nao encontrada' };
  }
  if (category.level !== expectedLevel) {
    return { error: `Categoria deve ser nivel ${expectedLevel}` };
  }
  return { category };
};

// Cria servico (admin ou profissional)
export const create = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      durationMinutes,
      category,
      subcategory,
      subcategory2,
      subcategory3,
      imageUrl
    } = req.body;

    if (!name || !price || !durationMinutes || !category) {
      return res.status(400).json({
        message: 'name, price, durationMinutes e category sao obrigatorios'
      });
    }

    const mainCategory = await validateCategoryLevel(category, 0);
    if (mainCategory?.error) {
      return res.status(400).json({ message: mainCategory.error });
    }

    const sub1 = await validateCategoryLevel(subcategory, 1);
    if (sub1?.error) {
      return res.status(400).json({ message: sub1.error });
    }

    const sub2 = await validateCategoryLevel(subcategory2, 2);
    if (sub2?.error) {
      return res.status(400).json({ message: sub2.error });
    }

    const sub3 = await validateCategoryLevel(subcategory3, 3);
    if (sub3?.error) {
      return res.status(400).json({ message: sub3.error });
    }

    const service = await createService({
      name,
      description,
      price,
      durationMinutes,
      category,
      subcategory: subcategory || null,
      subcategory2: subcategory2 || null,
      subcategory3: subcategory3 || null,
      imageUrl,
      professional: req.user.role === 'profissional' ? req.user.id : null
    });

    res.status(201).json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar servico' });
  }
};

// Lista servicos com filtros
export const list = async (req, res) => {
  try {
    const { category, subcategory, subcategory2, subcategory3, professionalId } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (subcategory2) filters.subcategory2 = subcategory2;
    if (subcategory3) filters.subcategory3 = subcategory3;
    if (professionalId) filters.professional = professionalId;

    const services = await listServices(filters);
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar servicos' });
  }
};

// Atualiza servico
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, durationMinutes, active } = req.body;

    const existing = await findServiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Servico nao encontrado' });
    }

    if (req.user.role === 'profissional' && String(existing.professional) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para editar este servico' });
    }

    const updated = await updateService(id, {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
      ...(active !== undefined ? { active } : {})
    });

    res.json({ service: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar servico' });
  }
};

// Atualiza imagem do servico
export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Imagem nao enviada' });
    }

    const existing = await findServiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Servico nao encontrado' });
    }

    if (req.user.role === 'profissional' && String(existing.professional) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para editar este servico' });
    }

    const imageUrl = `/uploads/services/${req.file.filename}`;
    const updated = await updateService(id, { imageUrl });

    res.json({ service: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar imagem do servico' });
  }
};

// Remove servico
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await findServiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Servico nao encontrado' });
    }

    if (req.user.role === 'profissional' && String(existing.professional) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para remover este servico' });
    }

    await deleteService(id);
    res.json({ message: 'Servico removido' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover servico' });
  }
};
