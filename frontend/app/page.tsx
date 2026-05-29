export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold gradient-text mb-4">
          ShopHub
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Luxury e-commerce with AI-powered recommendations
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="luxury-button"
          >
            Login
          </a>
          <a
            href="/dashboard"
            className="luxury-button bg-opacity-20"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
