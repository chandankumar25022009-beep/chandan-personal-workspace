import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/chandan-personal-workspace/',
  plugins: [react()],
})