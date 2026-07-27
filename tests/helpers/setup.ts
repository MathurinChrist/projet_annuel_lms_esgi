import { createError } from 'h3'

// Nuxt auto-imports these at runtime; Vitest needs them globally.
;(globalThis as any).createError = createError
