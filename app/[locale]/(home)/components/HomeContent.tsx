import Hero from './Hero'
import DeferredHomeSections from './DeferredHomeSections'

export default function HomeContent() {
  return (
    <div className="relative overflow-x-hidden selection:bg-[hsl(var(--brand-primary)/0.3)] selection:text-[hsl(var(--brand-ink))] [--home-display:var(--font-geist)] [--home-copy:var(--font-manrope)] [--home-mono:var(--font-geist)]">
      <div className="pointer-events-none fixed inset-0 hidden marketing-grid opacity-[0.34] sm:block" />
      <main className="relative z-10 mx-auto w-full max-w-[1240px]">
        <Hero />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
