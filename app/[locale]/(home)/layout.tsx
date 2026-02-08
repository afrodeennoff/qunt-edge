import MarketingLayoutShell from "../(landing)/components/marketing-layout-shell";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MarketingLayoutShell contentClassName="w-full">
      {children}
    </MarketingLayoutShell>
  );
}
