import Navbar from './navbar'
import Footer from './footer'
import { cn } from '@/lib/utils'

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode
  contentClassName?: string
  className?: string
}>

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1240px]',
  className,
}: MarketingLayoutShellProps) {
  return (
    <div className={cn('marketing-shell min-h-screen w-full overflow-x-hidden', className)}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(80%_48%_at_50%_0%,hsl(var(--brand-primary)/0.12),transparent_72%)] sm:hidden" />
      <div className="pointer-events-none fixed inset-0 hidden marketing-grid opacity-55 sm:block" />
      <div className="pointer-events-none fixed inset-x-0 top-0 hidden h-[520px] bg-[radial-gradient(50%_65%_at_50%_0%,hsl(var(--brand-primary)/0.14)_0%,transparent_72%)] sm:block" />
      <Navbar />
      <div className={cn('relative z-10 pt-20 sm:pt-28', contentClassName)}>{children}</div>
      <Footer />
    </div>
  )
}
