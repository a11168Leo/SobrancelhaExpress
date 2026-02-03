// src/services/authGuard.js

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('@SobrancelhaExpress:user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Erro ao parsear usuário:", err);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('@SobrancelhaExpress:token');
  localStorage.removeItem('@SobrancelhaExpress:user');
  // Opcional: limpar outros itens se precisar
};