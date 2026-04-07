/* ======================================== */
/* ARQUIVO: BACKEND/SRC/CATEGORIES/CATEGORY.SERVICE.JS */
/* ======================================== */

// Importacoes
import Category from './category.model.js';

// Funcao exportada: createCategory
export const createCategory = (data) => {
  return Category.create(data);
};

// Funcao exportada: findCategoryById
export const findCategoryById = (id) => {
  return Category.findById(id);
};

// Funcao exportada: listCategories
export const listCategories = (filters = {}) => {
  return Category.find(filters).sort({ name: 1 });
};

// Funcao exportada: updateCategory
export const updateCategory = (id, data) => {
  return Category.findByIdAndUpdate(id, data, { new: true });
};

// Funcao exportada: deleteCategory
export const deleteCategory = (id) => {
  return Category.findByIdAndDelete(id);
};

