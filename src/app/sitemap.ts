import type { MetadataRoute } from 'next'

const base = 'https://sergiomonsalve.com'
const locales = ['es', 'en']
const routes = ['', '/about', '/contact']

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap(locale =>
    routes.map(route => ({
      url: `${base}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8
    }))
  )
}
