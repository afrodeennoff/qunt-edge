'use client'

import dynamic from 'next/dynamic'

const ConsentBanner = dynamic(
  () => import('@/components/consent-banner').then((mod) => mod.ConsentBanner),
  { ssr: false }
)

export default function ConsentBannerLazy() {
  return <ConsentBanner />
}
