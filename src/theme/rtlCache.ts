import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

// Emotion cache that injects the RTL plugin into CSS generation.
// It makes MUI components mirror automatically right-to-left (margin-left -> margin-right, etc).
export const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
})
