import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // '/user': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true
      // },
      // '/adduser': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true
      // },
      // '/css': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true
      // }
    }
  }
})