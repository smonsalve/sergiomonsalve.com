import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import AboutBio from '@/components/AboutBio'
import AboutTimeline from '@/components/AboutTimeline'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: { es: '/es/about', en: '/en/about' }
    },
    openGraph: {
      title: `${t('aboutTitle')} — Sergio Monsalve`,
      description: t('aboutDescription'),
      url: `/${locale}/about`
    }
  }
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <AboutBio />
      <AboutTimeline />
    </div>
  )
}
