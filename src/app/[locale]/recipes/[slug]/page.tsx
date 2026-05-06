import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getRecipe, getRecipeSlugs } from '@/lib/recipes'
import MDXContent from '@/components/MDXContent'

export function generateStaticParams({ params: { locale } }: { params: { locale: string } }) {
  return getRecipeSlugs(locale).map(slug => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const recipe = getRecipe(slug, locale)
  if (!recipe) return {}
  return {
    title: recipe.title,
    description: recipe.description,
    alternates: { canonical: `/${locale}/recipes/${slug}` }
  }
}

export default async function RecipePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const recipe = getRecipe(slug, locale)
  if (!recipe) notFound()

  const t = await getTranslations({ locale, namespace: 'recipes' })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link
        href="/recipes"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        ← {t('title')}
      </Link>

      <p className="font-mono text-xs text-text-muted mb-2">{recipe.date}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-3">{recipe.title}</h1>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted mb-4">
        {recipe.time && <span>⏱ {recipe.time}</span>}
        {recipe.servings && <span>◎ {recipe.servings} {t('servings')}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-8">
        {recipe.tags.map(tag => (
          <span
            key={tag}
            className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {recipe.ingredients.length > 0 && (
        <div className="border border-border rounded-sm p-5 mb-10 bg-surface">
          <p className="font-mono text-xs text-accent mb-3">// {t('ingredients')}</p>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((item, i) => (
              <li key={i} className="text-xs text-text-secondary flex gap-2">
                <span className="text-accent shrink-0">–</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <MDXContent source={recipe.content} />
    </div>
  )
}
