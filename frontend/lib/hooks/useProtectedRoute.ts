'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '../auth/client'

export function useProtectedRoute() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      const returnTo = encodeURIComponent(pathname)
      router.push(`/login?returnTo=${returnTo}`)
    }
  }, [router, pathname])
}
