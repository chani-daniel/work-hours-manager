import type { ReactNode } from 'react'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import { rtlCache } from './rtlCache'

// Wraps the app with the styling infrastructure: RTL cache, the theme,
// and CssBaseline (baseline style reset).
export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
