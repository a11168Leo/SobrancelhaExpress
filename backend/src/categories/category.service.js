import Category from './category.model.js';

// Cria categoria
export const createCategory = (data) => {
  return Category.create(data);
};

// Busca categoria por id
export const findCategoryById = (id) => {
  return Category.findById(id);
};

// Lista categorias por nível e/ou pai
export const listCategories = (filters = {}) => {
  return Category.find(filters).sort({ name: 1 });
};

// Atualiza categoria
export const updateCategory = (id, data) => {
  return Category.findByIdAndUpdate(id, data, { new: true });
};

// Remove categoria
export const deleteCategory = (id) => {
  return Category.findByIdAndDelete(id);
};
