import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AdminApp from './AdminApp.tsx'
import { isAdminPath } from './routes'
import './style.css'

const isAdminRoute = isAdminPath(window.location.pathname, import.meta.env.BASE_URL)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>,
)