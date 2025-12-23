import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { SnackbarProviderApp } from './components/WithNotistack/SnackbarProviderApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SnackbarProviderApp>
      <App />
    </SnackbarProviderApp>
  </StrictMode>,
)
