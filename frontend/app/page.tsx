import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </main>
  )
}
