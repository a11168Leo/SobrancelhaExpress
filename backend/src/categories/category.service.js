
/*
====================
SECAO INTERNA PADRAO
====================
*/

import Category from './category.model.js';




export const createCategory = (data) => {
  return Category.create(data);
};




export const findCategoryById = (id) => {
  return Category.findById(id);
};




export const listCategories = (filters = {}) => {
  return Category.find(filters).sort({ name: 1 });
};




export const updateCategory = (id, data) => {
  return Category.findByIdAndUpdate(id, data, { new: true });
};




export const deleteCategory = (id) => {
  return Category.findByIdAndDelete(id);
};





