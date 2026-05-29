import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-96 space-y-4">
        <Input placeholder="Email address" />
        <Input type="password" placeholder="Password" />
        <Button className="w-full">Submit</Button>
      </div>
    </main>
  )
}
