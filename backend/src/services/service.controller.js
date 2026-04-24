/* ======================================== */
/* ARQUIVO: BACKEND/SRC/SERVICES/SERVICE.CONTROLLER.JS */
/* ======================================== */

// Importacoes
import {
  createService,
  findServiceById,
  listServices,
  updateService,
  deleteService
} from './service.service.js';
import { findCategoryById } from '../categories/category.service.js';
import { findUserById } from '../users/user.service.js';

const VALID_UNITS = ['cascais', 'almada'];

const normalizeUnit = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.includes('almada')) return 'almada';
  if (normalized.includes('cascais')) return 'cascais';
  return normalized;
};

const normalizeUnits = (value) => {
  const rawValues = Array.isArray(value)
    ? value
    : value === undefined || value === null || value === ''
      ? []
      : [value];

  const normalized = rawValues
    .map((item) => normalizeUnit(item))
    .filter(Boolean);

  return Array.from(new Set(normalized));
};

// Bloco: validateCategoryLevel
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

// Funcao exportada: create
export const create = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      durationMinutes,
      maxDurationMinutes,
      category,
      subcategory,
      subcategory2,
      subcategory3,
      imageUrl,
      unit,
      units
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

    const parsedDurationMinutes = Number(durationMinutes);
    const parsedMaxDurationMinutes =
      maxDurationMinutes !== undefined && maxDurationMinutes !== null && maxDurationMinutes !== ''
        ? Number(maxDurationMinutes)
        : null;

    if (!Number.isFinite(parsedDurationMinutes) || parsedDurationMinutes <= 0) {
      return res.status(400).json({ message: 'durationMinutes deve ser maior que zero' });
    }

    if (
      parsedMaxDurationMinutes !== null &&
      (!Number.isFinite(parsedMaxDurationMinutes) || parsedMaxDurationMinutes < parsedDurationMinutes)
    ) {
      return res.status(400).json({
        message: 'maxDurationMinutes deve ser maior ou igual a durationMinutes'
      });
    }

    let resolvedUnits = normalizeUnits(units);

    if (resolvedUnits.length === 0) {
      const fallbackUnit = normalizeUnit(unit);
      if (fallbackUnit) {
        resolvedUnits = [fallbackUnit];
      }
    }

    if (resolvedUnits.length === 0 && req.user?.role === 'profissional') {
      const professional = await findUserById(req.user.id);
      resolvedUnits = normalizeUnits(String(professional?.salonName || '').split(','));
    }

    if (resolvedUnits.some((item) => !VALID_UNITS.includes(item))) {
      return res.status(400).json({ message: 'units deve conter apenas cascais e/ou almada' });
    }

    if (resolvedUnits.length === 0) {
      return res.status(400).json({ message: 'Selecione pelo menos uma unidade para o servico' });
    }

    const service = await createService({
      name,
      description,
      price,
      durationMinutes: parsedDurationMinutes,
      maxDurationMinutes: parsedMaxDurationMinutes,
      category,
      subcategory: subcategory || null,
      subcategory2: subcategory2 || null,
      subcategory3: subcategory3 || null,
      imageUrl,
      professional: req.user?.role === 'profissional' ? req.user.id : null,
      ...(resolvedUnits.length > 0
        ? {
            units: resolvedUnits,
            ...(resolvedUnits.length === 1 ? { unit: resolvedUnits[0] } : { unit: undefined }),
          }
        : {})
    });

    res.status(201).json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar servico' });
  }
};

// Funcao exportada: list
export const list = async (req, res) => {
  try {
    const { category, subcategory, subcategory2, subcategory3, professionalId, unit } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (subcategory2) filters.subcategory2 = subcategory2;
    if (subcategory3) filters.subcategory3 = subcategory3;
    if (professionalId) filters.professional = professionalId;
    if (unit) {
      const normalizedUnit = normalizeUnit(unit);
      if (!VALID_UNITS.includes(normalizedUnit)) {
        return res.status(400).json({ message: 'unit deve ser cascais ou almada' });
      }
      filters.$or = [
        { units: normalizedUnit },
        { units: { $exists: false }, unit: normalizedUnit },
        { units: { $size: 0 }, unit: normalizedUnit },
      ];
    }

    const services = await listServices(filters);
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar servicos' });
  }
};

// Funcao exportada: update
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, durationMinutes, maxDurationMinutes, active, unit, units } = req.body;

    const existing = await findServiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Servico nao encontrado' });
    }

    if (req.user.role === 'profissional' && String(existing.professional) !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissao para editar este servico' });
    }

    const parsedDurationMinutes =
      durationMinutes !== undefined ? Number(durationMinutes) : existing.durationMinutes;
    const parsedMaxDurationMinutes =
      maxDurationMinutes !== undefined
        ? (maxDurationMinutes === null || maxDurationMinutes === '' ? null : Number(maxDurationMinutes))
        : existing.maxDurationMinutes;

    if (!Number.isFinite(parsedDurationMinutes) || parsedDurationMinutes <= 0) {
      return res.status(400).json({ message: 'durationMinutes deve ser maior que zero' });
    }

    if (
      parsedMaxDurationMinutes !== null &&
      (!Number.isFinite(parsedMaxDurationMinutes) || parsedMaxDurationMinutes < parsedDurationMinutes)
    ) {
      return res.status(400).json({
        message: 'maxDurationMinutes deve ser maior ou igual a durationMinutes'
      });
    }

    const normalizedUnits =
      units !== undefined
        ? normalizeUnits(units)
        : unit !== undefined
          ? normalizeUnits(unit)
          : undefined;

    if (normalizedUnits && normalizedUnits.some((item) => !VALID_UNITS.includes(item))) {
      return res.status(400).json({ message: 'units deve conter apenas cascais e/ou almada' });
    }

    const updated = await updateService(id, {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price } : {}),
      durationMinutes: parsedDurationMinutes,
      maxDurationMinutes: parsedMaxDurationMinutes,
      ...(active !== undefined ? { active } : {}),
      ...(normalizedUnits !== undefined
        ? {
            units: normalizedUnits,
            unit: normalizedUnits.length === 1 ? normalizedUnits[0] : undefined,
          }
        : {})
    });

    res.json({ service: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar servico' });
  }
};

// Funcao exportada: updateImage
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

// Funcao exportada: remove
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

