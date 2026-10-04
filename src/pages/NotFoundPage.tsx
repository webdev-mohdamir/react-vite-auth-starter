import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
      <Link className="mt-5 inline-block font-medium text-emerald-800 underline" to="/dashboard">
        Back to dashboard
      </Link>
    </section>
  )
}
