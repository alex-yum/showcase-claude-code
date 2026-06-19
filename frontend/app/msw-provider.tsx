'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const MSWReadyContext = createContext(process.env.NODE_ENV !== 'development')

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T | undefined>((resolve) => {
      window.setTimeout(resolve, timeoutMs)
    }),
  ])
}

function waitForServiceWorkerControl() {
  if (!('serviceWorker' in navigator) || navigator.serviceWorker.controller) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(done, 5000)

    function done() {
      window.clearTimeout(timeoutId)
      navigator.serviceWorker.removeEventListener('controllerchange', done)
      resolve()
    }

    navigator.serviceWorker.addEventListener('controllerchange', done)
  })
}

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(process.env.NODE_ENV !== 'development')

  useEffect(() => {
    const initMSW = async () => {
      if (process.env.NODE_ENV !== 'development') {
        setIsReady(true)
        return
      }

      if (navigator.userAgent.includes('Firefox') && window.location.pathname.startsWith('/dashboard')) {
        setIsReady(true)
        return
      }

      try {
        const { worker } = await import('@/mocks/browser')
        await withTimeout(
          worker.start({
            onUnhandledRequest: 'bypass',
          }),
          5000
        )
        await waitForServiceWorkerControl()
        console.log('[MSW] Mock service worker started')
      } catch (error) {
        console.error('[MSW] Failed to start service worker:', error)
      } finally {
        setIsReady(true)
      }
    }

    initMSW()
  }, [])

  return <MSWReadyContext.Provider value={isReady}>{children}</MSWReadyContext.Provider>
}

export function useMSWReady() {
  return useContext(MSWReadyContext)
}
