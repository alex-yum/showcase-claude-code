import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 mb-6">
          <Link href="/about" className="hover:text-gray-900 transition-colors font-medium">
            About Us
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors font-medium">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors font-medium">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-gray-900 transition-colors font-medium">
            Help Center
          </Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors font-medium">
            Contact Us
          </Link>
        </nav>
        <p className="text-center text-sm text-gray-500">
          &copy; 2026 ShopHub. Crafted with excellence.
        </p>
      </div>
    </footer>
  )
}
