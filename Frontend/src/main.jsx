import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './styles/global.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#12121a',
          color: '#ffffff',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          fontSize: '0.95rem',
        },
        duration: 3000,
      }}
    />
  </StrictMode>
)