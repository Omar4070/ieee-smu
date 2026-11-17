import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app uses hash routes (#/events), so one index.html serves every screen and
// relative asset paths work wherever it is hosted: on its own, or inside the
// website's build at /board/ (see .github/workflows/deploy.yml).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: process.env.BOARD_OUT_DIR || 'dist',
    emptyOutDir: true,
  },
  server: { port: 5174 },
  preview: { port: 4174 },
});
