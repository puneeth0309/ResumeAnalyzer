import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  jsx: 'react',
  preview: {
    allowedHosts: ['ai-resume-evaluator-and-job-matcher-1.onrender.com'],
  },
})
