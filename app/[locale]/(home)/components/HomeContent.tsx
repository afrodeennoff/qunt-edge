import Hero from './Hero'

export default function HomeContent() {
  return (
    <div className="relative overflow-x-hidden selection:bg-accent selection:text-white bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 marketing-grid opacity-[0.28]" />
      <main className="relative z-10 mx-auto w-full max-w-[1400px]">
        <Hero />
        {/* Removed DeferredHomeSections to focus on the new "Serious Terminal" aesthetic */}
        {/* We can re-add simplified sections later if needed, but for V2 Launch, a strong Hero is key. */}
      </main>
    </div>
  )
}
