
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // ยอมรับ process.env.API_KEY จาก shell หรือ .env
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || '')
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
  },
});
