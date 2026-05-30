import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Login - ShopHub',
  description: 'Sign in to your ShopHub account for exclusive deals and personalized recommendations',
}

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {/* Left column: Branding (hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 animate-fade-in-up">
          <div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold text-white mb-4">
              Welcome Back
            </h1>
            <p className="font-body text-lg text-gray-300 leading-relaxed">
              Experience luxury shopping with AI-powered recommendations
              tailored just for you.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="font-display text-3xl font-bold text-accent">
                50K+
              </div>
              <div className="font-body text-sm text-gray-400">
                Happy Customers
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-display text-3xl font-bold text-accent">
                10K+
              </div>
              <div className="font-body text-sm text-gray-400">
                Premium Products
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-display text-3xl font-bold text-accent">
                99.9%
              </div>
              <div className="font-body text-sm text-gray-400">
                Satisfaction Rate
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="pt-4 border-t border-accent/20">
            <p className="font-body text-sm text-gray-400 italic">
              "Luxury is in each detail" — Hubert de Givenchy
            </p>
          </div>
        </div>

        {/* Right column: Login form */}
        <div className="flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
