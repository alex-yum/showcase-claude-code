'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface MSWContextValue {
  mswReady: boolean
}

const MSWContext = createContext<MSWContextValue>({ mswReady: true })

export function useMSW() {
  return useContext(MSWContext)
}

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // In non-development environments MSW is not used, so it's always "ready"
  const [mswReady, setMswReady] = useState(process.env.NODE_ENV !== 'development')

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
        } finally {
          setMswReady(true)
        }
      }
    }

    initMSW()
  }, [])

  return <MSWContext.Provider value={{ mswReady }}>{children}</MSWContext.Provider>
}
