import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://qunt-edge.vercel.app'
  const lastModified = new Date('2026-03-13T00:00:00.000Z')
  const locales = ['en', 'fr']
  const routeDefs: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/support', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/community', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/updates', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/disclaimers', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/propfirms', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/referral', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/deals', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/deals/compare', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/deals/guides', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/deals/calculator', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/deals/faq', changeFrequency: 'weekly', priority: 0.7 },
  ]

  return locales.flatMap((locale) =>
    routeDefs.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )
}
