import Hero from './Hero'
import DeferredHomeSections from './DeferredHomeSections'

export default function HomeContent() {
  return (
    <div className="relative overflow-x-hidden bg-base text-fg-primary selection:bg-primary/30">
      <div className="pointer-events-none fixed inset-0 opacity-[0.02] bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(950px_circle_at_18%_-10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(850px_circle_at_88%_0%,rgba(16,185,129,0.14),transparent_52%)]" />

      <main className="relative z-10 mx-auto w-full max-w-[1400px]">
        <Hero />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
