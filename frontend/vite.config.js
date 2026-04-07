/* ======================================== */
/* ARQUIVO: FRONTEND/VITE.CONFIG.JS */
/* ======================================== */

// Importacoes
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

// Exportacao principal
export default defineConfig({
  plugins: [react()],
})
