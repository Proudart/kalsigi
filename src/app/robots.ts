import { MetadataRoute } from 'next'
import { getBaseUrl } from '../lib/utils'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/series/[series]', '/series/[series]/[chapter]'],
      disallow: ['/about','/licensing','/privacy','/signout','/signin','/settings']
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  }
}
