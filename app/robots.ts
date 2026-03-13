import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/en/dashboard',
        '/en/dashboard/',
        '/fr/dashboard',
        '/fr/dashboard/',
        '/en/admin',
        '/en/admin/',
        '/fr/admin',
        '/fr/admin/',
        '/en/teams/dashboard',
        '/en/teams/dashboard/',
        '/fr/teams/dashboard',
        '/fr/teams/dashboard/',
        '/en/authentication',
        '/en/authentication/',
        '/fr/authentication',
        '/fr/authentication/',
      ],
    },
    sitemap: 'https://qunt-edge.vercel.app/sitemap.xml',
  }
}
