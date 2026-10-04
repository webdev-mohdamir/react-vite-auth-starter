import { ItemList } from '../features/items/ItemList'
import { ItemStats } from '../features/items/ItemStats'

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A clear view of your items, progress, and ratings.
        </p>
      </section>
      <ItemStats />
      <ItemList />
    </div>
  )
}
