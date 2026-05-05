import { useTranslations } from 'next-intl'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  const t = useTranslations('contact')
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-3">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">
        {t('title')}
      </h1>
      <ContactForm />
    </div>
  )
}
