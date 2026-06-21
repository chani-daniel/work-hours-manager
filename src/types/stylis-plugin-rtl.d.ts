// stylis-plugin-rtl ships no type declarations and has no @types package,
// so we declare a minimal module shape for it here.
declare module 'stylis-plugin-rtl' {
  import type { Middleware } from 'stylis'
  const rtlPlugin: Middleware
  export default rtlPlugin
}
