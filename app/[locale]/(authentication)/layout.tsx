'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface AuthenticationLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticationLayout({
  children
}: AuthenticationLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1)); // Remove the # and parse

    if (params.get('error')) {
      const errorDescription = params.get('error_description');
      toast.error("Authentication Error", {
        description: errorDescription?.replace(/\+/g, ' ') || "An error occurred during authentication",
      });

      // Clear the hash after showing the toast
      router.replace('/authentication');
    }
  }, [router]);

  return children;
}
