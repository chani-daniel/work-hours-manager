import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Heebo font (Hebrew-friendly), self-hosted via @fontsource.
import '@fontsource/heebo/400.css'
import '@fontsource/heebo/500.css'
import '@fontsource/heebo/700.css'
import { AppThemeProvider } from './theme/AppThemeProvider.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
)
