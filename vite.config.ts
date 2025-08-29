import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['dac802d8039d.ngrok-free.app', 'localhost', '127.0.0.1']
  }
});
