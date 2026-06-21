import { createTheme } from '@mui/material/styles'

// Central MUI theme for the whole app: RTL direction, palette, and typography.
// Every component inherits from here, so there is no need to style each one separately.
export const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#0e7c86', // teal: calm, professional primary color
    },
    secondary: {
      main: '#f59e0b', // amber: for accents and alerts later
    },
    background: {
      default: '#f6f8f9',
    },
  },
  typography: {
    fontFamily: ['Heebo', 'Arial', 'sans-serif'].join(','),
  },
  shape: {
    borderRadius: 10,
  },
})
