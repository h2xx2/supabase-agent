import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['d7065f427563.ngrok-free.app', 'localhost', '127.0.0.1']
  }
});
