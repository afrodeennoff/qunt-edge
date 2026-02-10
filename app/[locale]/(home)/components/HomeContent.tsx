import Hero from './Hero'
import DeferredHomeSections from './DeferredHomeSections'

export default function HomeContent() {
  return (
    <div className="relative overflow-x-hidden selection:bg-[hsl(var(--brand-primary)/0.28)] selection:text-[hsl(var(--brand-ink))]">
      <div className="pointer-events-none fixed inset-0 marketing-grid opacity-[0.28]" />
      <main className="relative z-10 mx-auto w-full max-w-[1400px]">
        <Hero />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
