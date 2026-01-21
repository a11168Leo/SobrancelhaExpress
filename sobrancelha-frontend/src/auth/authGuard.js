
// Pega os dados do usuário armazenados no localStorage
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  if (!token) return null;
  return { token, name, role };
};

// Verifica se o usuário está logado
export const isLoggedIn = () => !!localStorage.getItem("token");

// Verifica se o usuário tem a role necessária
export const requireRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role;
};

// Função para deslogar o usuário
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
};
