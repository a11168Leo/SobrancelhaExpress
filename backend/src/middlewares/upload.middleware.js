import { serviceImageUpload, professionalAvatarUpload } from '../config/multer.js';

// Middleware para upload de imagem de servico
export const uploadServiceImage = serviceImageUpload.single('image');

// Middleware para upload de avatar de profissional
export const uploadProfessionalAvatar = professionalAvatarUpload.single('image');
