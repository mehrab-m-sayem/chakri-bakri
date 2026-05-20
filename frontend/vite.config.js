import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // PROXY: This is the key to connecting frontend ↔ backend during development.
  // When your React app makes a request to "/auth/login" or "/jobs",
  // Vite sees it starts with "/auth" or "/jobs" and forwards it to your
  // Express backend running on port 5003.
  // Without this, the browser would try to find those routes on port 5173 (Vite's port)
  // and get a 404 error.
  server: {
    proxy: {
      '/auth': 'http://localhost:5003',
      '/jobs': 'http://localhost:5003',
    },
  },
})
