
/*
====================
SECAO INTERNA PADRAO
====================
*/

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  PROFISSIONAL: 'profissional',
  CLIENTE: 'cliente'
});




export const isValidRole = (role) => Object.values(ROLES).includes(role);





