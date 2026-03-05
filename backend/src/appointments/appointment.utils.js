
/*
====================
SECAO INTERNA PADRAO
====================
*/

export const isOverlapping = (newStart, newEnd, existingStart, existingEnd) => {
  return newStart < existingEnd && newEnd > existingStart;
};



