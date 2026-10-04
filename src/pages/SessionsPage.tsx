import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useRevokeSession, useSessions } from '../features/items/hooks'

export function SessionsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { data: sessions, isLoading, isError, error, refetch } = useSessions()
  const revokeSession = useRevokeSession()
  const [formError, setFormError] = useState('')

  const revoke = async (id: string, current: boolean) => {
    setFormError('')
    try {
      await revokeSession.mutateAsync(id)
      if (current) {
        await logout()
        navigate('/login', { replace: true })
      }
    } catch (revokeError) {
      setFormError(revokeError instanceof Error ? revokeError.message : 'Could not revoke this session.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Security</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Active sessions</h1>
        <p className="mt-3 text-slate-600">Review devices signed into your account and revoke any you no longer use.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6" aria-label="Loading sessions">
            {[1, 2].map((row) => <div className="h-24 animate-pulse rounded-xl bg-slate-100" key={row} />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-700" role="alert">Could not load sessions: {error.message}</p>
            <button className="mt-3 text-sm font-semibold text-emerald-800 underline" onClick={() => void refetch()} type="button">Try again</button>
          </div>
        ) : sessions?.length ? (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <li className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:px-6" key={session._id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-all font-semibold text-slate-900">{session.userAgent || 'Unknown device'}</p>
                    {session.current && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">This device</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">IP address: {session.ip || 'Unavailable'}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Last used <time dateTime={session.lastUsedAt}>{formatDate(session.lastUsedAt)}</time></span>
                    <span>Expires <time dateTime={session.expiresAt}>{formatDate(session.expiresAt)}</time></span>
                  </div>
                </div>
                <button
                  className="shrink-0 self-start rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
                  disabled={revokeSession.isPending && revokeSession.variables === session._id}
                  onClick={() => void revoke(session._id, session.current)}
                  type="button"
                >
                  {revokeSession.isPending && revokeSession.variables === session._id ? 'Revoking…' : 'Revoke'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-14 text-center">
            <h2 className="font-semibold text-slate-900">No active sessions</h2>
            <p className="mt-1 text-sm text-slate-500">Your active devices will appear here.</p>
          </div>
        )}
      </section>
      {formError && <p className="text-sm text-rose-700" role="alert">{formError}</p>}
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString()
}
