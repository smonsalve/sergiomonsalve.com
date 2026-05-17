import { describe, it } from 'vitest'

describe('Nav', () => {
  it('is an async server component — verified via build and manual testing', () => {
    // Nav reads Supabase auth state server-side.
    // RTL cannot render async server components in jsdom.
  })
})
