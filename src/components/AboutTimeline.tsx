import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import SkillTag from './SkillTag'

const experience = [
  {
    period: 'Nov 2022 → Apr 2025',
    company: 'Globant',
    role: 'Senior Python Developer',
    current: false,
    tech: ['Python', 'LangChain', 'OpenAI', 'Dagster', 'FastAPI', 'Golang']
  },
  {
    period: 'Jun 2021 → May 2022',
    company: 'Human Living Data',
    role: 'Co-founder & IT Lead',
    current: false,
    tech: ['Python', 'Scikit-learn', 'Dash Plotly', 'RPA', 'AWS']
  },
  {
    period: 'Mar 2020 → Jun 2021',
    company: 'Inmotion Group',
    role: 'IT Lead',
    current: false,
    tech: ['Python', 'Pandas', 'Scikit-learn', 'AWS', 'GIS']
  },
  {
    period: 'Nov 2018 → Mar 2020',
    company: 'Leonisa',
    role: 'Data Analyst',
    current: false,
    tech: ['Python', 'Tableau', 'PowerBI', 'ETL']
  }
]

const education = [
  {
    period: '2024 → 2026',
    institution: 'Universidad EAFIT',
    degree: 'MSc Engineering (Candidate)'
  },
  {
    period: '→ 2013',
    institution: 'Universidad EAFIT',
    degree: 'BS Systems Engineering'
  }
]

export default function AboutTimeline() {
  const t = useTranslations('about')

  return (
    <div>
      <p className="font-mono text-xs text-text-muted mb-6">{t('experienceTitle')}</p>
      <div className="space-y-6 mb-12">
        {experience.map(job => (
          <div
            key={job.company}
            className={`border-l-2 pl-4 ${
              job.current ? 'border-accent' : 'border-border'
            }`}
          >
            <p
              className={`font-mono text-xs mb-1 ${
                job.current ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {job.period}
            </p>
            <p
              className={`font-semibold text-sm mb-0.5 ${
                job.current ? 'text-text' : 'text-text-secondary'
              }`}
            >
              {job.role} · {job.company}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.tech.map(techItem => (
                <SkillTag key={techItem} label={techItem} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-text-muted mb-6">{t('educationTitle')}</p>
      <div className="space-y-4 mb-16">
        {education.map(edu => (
          <div key={edu.institution} className="border-l-2 border-border pl-4">
            <p className="font-mono text-xs text-text-muted mb-1">{edu.period}</p>
            <p className="text-sm font-semibold text-text-secondary">{edu.degree}</p>
            <p className="text-xs text-text-muted">{edu.institution}</p>
          </div>
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
      <div className="relative aspect-video rounded-sm overflow-hidden border border-border mb-6">
        <Image
          src="/about/sergio-parapente.jpg"
          alt="Parapente en las montañas de Antioquia"
          fill
          className="object-cover object-center"
        />
      </div>
      <Link
        href="/blog/2026-05-09-mas-alla-del-codigo"
        className="font-mono text-xs text-accent hover:underline"
      >
        {t('beyondTheCodeLink')} →
      </Link>
    </div>
  )
}
