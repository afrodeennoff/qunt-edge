import { Toaster } from "@/components/ui/sonner";
import { RootProviders } from "@/components/providers/root-providers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
      <RootProviders>
        <div className="min-h-screen flex flex-col bg-background">
          <Toaster />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </RootProviders>
  );
}
