
/*
====================
SECAO INTERNA PADRAO
====================
*/

import { serviceImageUpload, professionalAvatarUpload } from '../config/multer.js';




export const uploadServiceImage = serviceImageUpload.single('image');




export const uploadProfessionalAvatar = professionalAvatarUpload.single('image');





