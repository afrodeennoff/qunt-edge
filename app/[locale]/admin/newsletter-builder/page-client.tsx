"use client"

import dynamic from "next/dynamic"
import { NewsletterProvider } from "@/app/[locale]/admin/components/newsletter/newsletter-context"
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable"

const NewsletterEditor = dynamic(
  () => import("@/app/[locale]/admin/components/newsletter/newsletter-editor").then((m) => m.NewsletterEditor),
  { ssr: false, loading: () => <div>Loading editor...</div> }
)

const NewsletterPreview = dynamic(
  () => import("@/app/[locale]/admin/components/newsletter/newsletter-preview").then((m) => m.NewsletterPreview),
  { ssr: false, loading: () => <div>Loading preview...</div> }
)

const SubscriberTable = dynamic(
  () => import("@/app/[locale]/admin/components/newsletter/subscriber-table").then((m) => m.SubscriberTable),
  { ssr: false, loading: () => <div>Loading subscribers...</div> }
)

export default function NewsletterBuilderPageClient() {
  return (
    <div className="container mx-auto space-y-8 py-6">
      <NewsletterProvider>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[600px] rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4">
              <NewsletterEditor />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4">
              <NewsletterPreview />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Subscribers</h2>
          <SubscriberTable />
        </div>
      </NewsletterProvider>
    </div>
  )
}
