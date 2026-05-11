'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GuestbookAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(() => {
      // Remove the code from the URL and refresh the page to show the form
      router.replace(window.location.pathname)
    })
  }, [searchParams, router])

  return null
}
