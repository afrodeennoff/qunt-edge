import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/en/dashboard/',
        '/fr/dashboard/',
        '/en/admin/',
        '/fr/admin/',
        '/en/teams/dashboard/',
        '/fr/teams/dashboard/',
        '/en/authentication/',
        '/fr/authentication/',
      ],
    },
    sitemap: 'https://qunt-edge.vercel.app/sitemap.xml',
  }
}
