import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/*/dashboard',
        '/admin',
        '/*/admin',
        '/teams/dashboard',
        '/*/teams/dashboard',
        '/authentication',
        '/*/authentication',
      ],
    },
    sitemap: 'https://qunt-edge.vercel.app/sitemap.xml',
  }
}
