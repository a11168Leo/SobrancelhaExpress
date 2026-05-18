/* ======================================== */
/* ARQUIVO: BACKEND/SRC/CATEGORIES/CATEGORY.CONTROLLER.JS */
/* ======================================== */

// Importacoes
import {
  createCategory,
  findCategoryById,
  listCategories,
  updateCategory,
  deleteCategory
} from './category.service.js';

// Funcao exportada: create
export const create = async (req, res) => {
  try {
    const { name, parentId, level } = req.body;

    if (!name || level === undefined) {
      return res.status(400).json({ message: 'name e level sao obrigatorios' });
    }

    const normalizedLevel = Number(level);
    if (![0, 1, 2, 3].includes(normalizedLevel)) {
      return res.status(400).json({ message: 'level deve ser 0, 1, 2 ou 3' });
    }

    if (normalizedLevel === 0 && parentId) {
      return res.status(400).json({ message: 'Categoria nivel 0 nao pode ter pai' });
    }

    if (normalizedLevel > 0) {
      if (!parentId) {
        return res.status(400).json({ message: 'parentId e obrigatorio para niveis 1 a 3' });
      }

      const parent = await findCategoryById(parentId);
      if (!parent) {
        return res.status(404).json({ message: 'Categoria pai nao encontrada' });
      }

      if (parent.level !== normalizedLevel - 1) {
        return res.status(400).json({
          message: 'O nivel do pai deve ser exatamente level - 1'
        });
      }
    }

    const category = await createCategory({
      name,
      level: normalizedLevel,
      parent: parentId || null
    });

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar categoria' });
  }
};

// Funcao exportada: list
export const list = async (req, res) => {
  try {
    const { level, parentId } = req.query;

    const filters = {};
    if (level !== undefined) {
      filters.level = Number(level);
    }
    if (parentId) {
      filters.parent = parentId;
    }

    const categories = await listCategories(filters);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar categorias' });
  }
};

// Funcao exportada: update
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const category = await findCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria nao encontrada' });
    }

    if (parentId !== undefined) {
      if (category.level === 0 && parentId) {
        return res.status(400).json({ message: 'Categoria nivel 0 nao pode ter pai' });
      }

      if (category.level > 0) {
        const parent = await findCategoryById(parentId);
        if (!parent) {
          return res.status(404).json({ message: 'Categoria pai nao encontrada' });
        }
        if (parent.level !== category.level - 1) {
          return res.status(400).json({
            message: 'O nivel do pai deve ser exatamente level - 1'
          });
        }
      }
    }

    const updated = await updateCategory(id, {
      ...(name ? { name } : {}),
      ...(parentId !== undefined ? { parent: parentId || null } : {})
    });

    res.json({ category: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
};

// Funcao exportada: remove
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await deleteCategory(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria nao encontrada' });
    }

    res.json({ message: 'Categoria removida' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover categoria' });
  }
};
