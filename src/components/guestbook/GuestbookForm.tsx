'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

type User = {
  display_name: string
  avatar_url: string | null
}

export default function GuestbookForm({
  user,
  placeholder,
  submitLabel,
  signedInAs,
  signOutLabel,
  pendingMsg,
}: {
  user: User
  placeholder: string
  submitLabel: string
  signedInAs: string
  signOutLabel: string
  pendingMsg: string
}) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('loading')
    const res = await fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (status === 'done') {
    return (
      <p className="font-mono text-xs text-accent py-6">{pendingMsg}</p>
    )
  }

  return (
    <div className="py-6 border-b border-border">
      <div className="flex items-center gap-2 mb-4">
        {user.avatar_url && (
          <Image
            src={user.avatar_url}
            alt={user.display_name}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span className="font-mono text-xs text-text-muted">
          {signedInAs} <span className="text-text">{user.display_name}</span>
        </span>
        <button
          onClick={handleSignOut}
          className="ml-auto font-mono text-xs text-text-muted hover:text-accent transition-colors"
        >
          {signOutLabel}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-surface border border-border text-text text-sm font-mono px-3 py-2 rounded-sm resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-text-muted">{message.length}/280</span>
          <button
            type="submit"
            disabled={status === 'loading' || !message.trim()}
            className="bg-text text-background font-mono text-xs px-4 py-2 rounded-sm hover:bg-accent transition-colors disabled:opacity-40"
          >
            {status === 'loading' ? '...' : submitLabel}
          </button>
        </div>
        {status === 'error' && (
          <p className="font-mono text-xs text-red-400">Algo salió mal. Intenta de nuevo.</p>
        )}
      </form>
    </div>
  )
}
