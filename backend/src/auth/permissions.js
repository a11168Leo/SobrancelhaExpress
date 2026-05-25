/* ======================================== */
/* ARQUIVO: BACKEND/SRC/AUTH/PERMISSIONS.JS */
/* ======================================== */

// Funcao exportada: ROLES
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  PROFISSIONAL: 'profissional',
  CLIENTE: 'cliente'
});

// Funcao exportada: isValidRole
export const isValidRole = (role) => Object.values(ROLES).includes(role);

