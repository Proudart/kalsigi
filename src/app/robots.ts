import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/series/[series]', '/series/[series]/[chapter]'],
      disallow: ['/about','/licensing','/privacy','/signout','/signin','/settings']
    },
    sitemap: `https://www.${process.env.site_name}.com/sitemap.xml`,
  }
}
