// Papéis do sistema (RBAC)
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  PROFISSIONAL: 'profissional',
  CLIENTE: 'cliente'
});

// Valida se o papel existe
export const isValidRole = (role) => Object.values(ROLES).includes(role);
