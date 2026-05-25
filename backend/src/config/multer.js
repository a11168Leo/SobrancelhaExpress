/* ======================================== */
/* ARQUIVO: BACKEND/SRC/CONFIG/MULTER.JS */
/* ======================================== */

// Importacoes
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Bloco: ensureDir
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Bloco: createStorage
const createStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = path.resolve('uploads', folder);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, '-');
      cb(null, `${timestamp}-${safeName}`);
    }
  });

// Bloco: imageFilter
const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Arquivo deve ser uma imagem (jpeg, png, webp)'));
  }
  return cb(null, true);
};

// Funcao exportada: serviceImageUpload
export const serviceImageUpload = multer({
  storage: createStorage('services'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Funcao exportada: professionalAvatarUpload
export const professionalAvatarUpload = multer({
  storage: createStorage('professionals'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

