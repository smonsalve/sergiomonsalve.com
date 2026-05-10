import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function AboutBio() {
  const t = useTranslations('about')
  const skillGroups = t.raw('skillGroups') as string[]

  return (
    <div className="mb-16">
      <div className="flex items-start gap-6 mb-8">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-sm overflow-hidden border border-border">
          <Image
            src="/about/sergio-profile.jpg"
            alt="Sergio Monsalve"
            fill
            className="object-cover"
          />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {t('bio')}
        </p>
      </div>

      <p className="font-mono text-xs text-text-muted mb-4">{t('skillsTitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-w-lg">
        {skillGroups.map(group => (
          <p key={group} className="text-sm text-text-secondary">
            <span className="text-accent mr-2">▸</span>
            {group}
          </p>
        ))}
      </div>

      <p className="font-mono text-xs text-text-muted mb-3">{t('personalLabel')}</p>
      <div className="text-sm text-text-secondary space-y-1 mb-4">
        <p>
          <span aria-hidden="true">🍄</span>{' '}
          <a
            href="https://songosorhongo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {t('songosorhongoLabel')}
          </a>
        </p>
        <p>{t('location')}</p>
      </div>
      <div className="relative aspect-video rounded-sm overflow-hidden border border-border mb-8">
        <Image
          src="/about/sergio-parapente.jpg"
          alt="Parapente en las montañas de Antioquia"
          fill
          className="object-cover object-top"
        />
      </div>

      <a
        href="https://orlniujfwolyinsuezcu.supabase.co/storage/v1/object/public/assets/cv-sergio-monsalve.pdf"
        target="_blank"
        rel="noopener noreferrer"
        download
        className="inline-block bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
      >
        {t('downloadCv')}
      </a>
    </div>
  )
}
