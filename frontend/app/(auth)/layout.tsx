import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - ShopHub',
  description: 'Sign in to your ShopHub account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-surface to-primary">
      {/* Animated floating orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '0s', animationDuration: '20s' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-light/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '5s', animationDuration: '25s' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-dark/15 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '10s', animationDuration: '30s' }}
        aria-hidden="true"
      />

      {/* Skip to content link (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-primary focus:rounded-md focus:ring-4 focus:ring-accent/50"
      >
        Skip to main content
      </a>

      {/* Main content */}
      <main id="main-content" className="relative z-10 w-full">
        {children}
      </main>
    </div>
  )
}
