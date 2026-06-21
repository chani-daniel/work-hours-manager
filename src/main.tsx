import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
// Heebo font (Hebrew-friendly), self-hosted via @fontsource.
import '@fontsource/heebo/400.css'
import '@fontsource/heebo/500.css'
import '@fontsource/heebo/700.css'
import { AppThemeProvider } from './theme/AppThemeProvider.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import { queryClient } from './data/queryClient.ts'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  </StrictMode>,
)
