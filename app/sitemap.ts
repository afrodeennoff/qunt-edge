import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://qunt-edge.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://qunt-edge.vercel.app/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://qunt-edge.vercel.app/pricing',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://qunt-edge.vercel.app/updates',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://qunt-edge.vercel.app/support',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://qunt-edge.vercel.app/authentication',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: 'https://qunt-edge.vercel.app/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://qunt-edge.vercel.app/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://qunt-edge.vercel.app/propfirms',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]
}