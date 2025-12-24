import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['50f79b811a21.ngrok-free.app', 'localhost', '127.0.0.1']
  }
});