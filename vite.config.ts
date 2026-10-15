import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' && !process.env.VERCEL ? '/chandan-personal-workspace/' : '/',
  define: { __PORTFOLIO_BACKEND_ENABLED__: JSON.stringify(Boolean(process.env.VERCEL)) },
  plugins: [react()],
}))