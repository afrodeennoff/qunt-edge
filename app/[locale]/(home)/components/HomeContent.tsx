import Hero from './Hero'
import DeferredHomeSections from './DeferredHomeSections'

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <div className="relative overflow-x-hidden bg-[radial-gradient(1200px_480px_at_50%_-10%,hsl(var(--foreground)/0.09),transparent_68%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_36%,hsl(var(--background))_100%)] selection:bg-[hsl(var(--brand-primary)/0.3)] selection:text-[hsl(var(--brand-ink))] [--home-display:var(--font-geist)] [--home-copy:var(--font-manrope)] [--home-mono:var(--font-geist)]">
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-[0.2] sm:block" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_340px_at_10%_20%,hsl(var(--foreground)/0.05),transparent_70%),radial-gradient(700px_320px_at_92%_6%,hsl(var(--foreground)/0.04),transparent_70%)]" />
      <main className="relative z-10 mx-auto w-full max-w-[1360px]">
        <Hero locale={locale} />
        <DeferredHomeSections />
      </main>
    </div>
  )
}
