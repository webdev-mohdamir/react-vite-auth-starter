import { useItemStats } from './hooks'

export function ItemStats() {
  const { data, isLoading, isError, error } = useItemStats()

  if (isLoading) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading item statistics">{[1, 2, 3, 4].map((number) => <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" key={number} />)}</div>
  }

  if (isError) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">Could not load item statistics: {error.message}</p>
  }

  if (!data) return null

  const largestBucket = Math.max(1, ...data.ratingHistogram.map((bucket) => bucket.count))

  return (
    <section aria-label="Item statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total items" value={data.total.toString()} />
      <StatCard label="Open" value={data.perStatus.open.toString()} />
      <StatCard label="Completed" value={data.perStatus.done.toString()} />
      <StatCard label="Average rating" value={data.averageRating.toFixed(1)} detail={`${data.ratingHistogram.reduce((sum, bucket) => sum + bucket.count, 0)} rated`} />
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-4">
        <h2 className="text-sm font-semibold text-slate-700">Rating distribution</h2>
        <div className="mt-4 grid grid-cols-5 gap-3">
          {data.ratingHistogram.map(({ rating, count }) => {
            return (
              <div className="text-center" key={rating}>
                <div className="flex h-16 items-end justify-center rounded-md bg-slate-50">
                  <div
                    aria-label={`${count} items rated ${rating} stars`}
                    className="w-5 rounded-t bg-emerald-600"
                    style={{ height: `${Math.max(count ? 8 : 0, (count / largestBucket) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-slate-600">{rating}★ · {count}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </article>
  )
}
