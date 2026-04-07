/* ======================================== */
/* ARQUIVO: BACKEND/SRC/MIDDLEWARES/UPLOAD.MIDDLEWARE.JS */
/* ======================================== */

// Importacoes
import { serviceImageUpload, professionalAvatarUpload } from '../config/multer.js';

// Funcao exportada: uploadServiceImage
export const uploadServiceImage = serviceImageUpload.single('image');

// Funcao exportada: uploadProfessionalAvatar
export const uploadProfessionalAvatar = professionalAvatarUpload.single('image');

