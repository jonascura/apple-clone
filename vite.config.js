import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    legalComments: 'none',
    minify: 'esbuild', // Use Terser instead of esbuild if you want more control
  },
})
