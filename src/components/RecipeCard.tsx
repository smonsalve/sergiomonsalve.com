import { Link } from '@/i18n/navigation'
import type { RecipeMeta } from '@/lib/recipes'

export default function RecipeCard({ recipe, locale }: { recipe: RecipeMeta; locale: string }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      locale={locale as 'es' | 'en'}
      className="block border border-border hover:border-accent transition-colors p-5 rounded-sm group"
    >
      <div className="flex items-center gap-4 font-mono text-xs text-text-muted mb-2">
        <span>{recipe.date}</span>
        {recipe.time && <span>⏱ {recipe.time}</span>}
        {recipe.servings && <span>◎ {recipe.servings}</span>}
      </div>
      <h2 className="text-sm font-semibold text-text group-hover:text-accent transition-colors mb-2">
        {recipe.title}
      </h2>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{recipe.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {recipe.tags.map(tag => (
          <span key={tag} className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
