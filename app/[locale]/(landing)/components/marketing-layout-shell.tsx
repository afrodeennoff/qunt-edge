import Navbar from "./navbar";
import Footer from "./footer";
import { cn } from "@/lib/utils";

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode;
  contentClassName?: string;
  className?: string;
}>;

export default function MarketingLayoutShell({
  children,
  contentClassName = "mx-auto w-full max-w-7xl",
  className,
}: MarketingLayoutShellProps) {
  return (
    <div className={cn("marketing-shell min-h-screen w-full overflow-x-hidden", className)}>
      <div className="pointer-events-none fixed inset-0 marketing-grid opacity-70" />
      <div className="pointer-events-none fixed -left-40 top-8 h-[300px] w-[300px] rounded-full bg-[hsl(var(--brand-warm)/0.35)] marketing-orb" />
      <div className="pointer-events-none fixed -right-24 top-10 h-[260px] w-[260px] rounded-full bg-[hsl(var(--brand-primary)/0.35)] marketing-orb [animation-delay:1.5s]" />
      <Navbar />
      <div className={cn("relative z-10 pt-24 sm:pt-28 xl:pt-32", contentClassName)}>{children}</div>
      <Footer />
    </div>
  );
}
