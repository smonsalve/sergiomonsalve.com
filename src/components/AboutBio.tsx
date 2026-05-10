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
