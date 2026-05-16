import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { BookMeta, BookStatus } from '@/lib/library'
import StarRating from './StarRating'

const statusClass: Record<BookStatus, string> = {
  listening: 'text-accent',
  completed: 'text-text-secondary',
  queued: 'text-text-muted',
  abandoned: 'text-text-muted line-through',
}

export default function BookCard({
  book,
  locale,
  statusLabel,
}: {
  book: BookMeta
  locale: string
  statusLabel: string
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <Link
      href={`/biblioteca/${book.asin}`}
      locale={locale as 'es' | 'en'}
      className="block border border-border hover:border-accent transition-colors p-4 rounded-sm group"
    >
      <div className="flex gap-4">
        <div className="shrink-0 w-16 h-20 relative rounded-sm overflow-hidden bg-surface">
          {book.cover_url && (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`font-mono text-xs ${statusClass[book.status]}`}>
              {statusLabel}
            </span>
            {book.rating !== null && <StarRating rating={book.rating} />}
          </div>
          <h2 className="text-sm font-semibold text-text group-hover:text-accent transition-colors mb-1 truncate">
            {book.title}
          </h2>
          <p className="font-mono text-xs text-text-muted mb-1">{book.authors.join(', ')}</p>
          {book.runtime_length_min > 0 && (
            <p className="font-mono text-xs text-text-muted">
              {hours}h {minutes}m
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
