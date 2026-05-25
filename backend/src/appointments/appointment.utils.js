/* ======================================== */
/* ARQUIVO: BACKEND/SRC/APPOINTMENTS/APPOINTMENT.UTILS.JS */
/* ======================================== */

// Funcao exportada: isOverlapping
export const isOverlapping = (newStart, newEnd, existingStart, existingEnd) => {
  return newStart < existingEnd && newEnd > existingStart;
};

