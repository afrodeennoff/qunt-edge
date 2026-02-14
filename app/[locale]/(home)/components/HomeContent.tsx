import Hero from './Hero'
import DeferredHomeSections from './DeferredHomeSections'

export default function HomeContent() {
  return (
    <div className="relative overflow-x-hidden selection:bg-[hsl(var(--brand-primary)/0.3)] selection:text-[hsl(var(--brand-ink))] [--home-display:var(--font-geist)] [--home-copy:var(--font-geist)] [--home-mono:var(--font-ibm-mono)]">
      <div className="pointer-events-none fixed inset-0 marketing-grid opacity-[0.34]" />
      <main className="relative z-10 mx-auto w-full max-w-[1240px]">
        <Hero />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
