'use client'

import { useEffect } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initMSW = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const { worker } = await import('@/mocks/browser')
          await worker.start({
            onUnhandledRequest: 'bypass',
          })
          console.log('[MSW] Mock service worker started')
        } catch (error) {
          console.error('[MSW] Failed to start service worker:', error)
        }
      }
    }

    initMSW()
  }, [])

  // Don't block rendering - MSW will intercept requests once ready
  return <>{children}</>
}
