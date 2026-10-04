import { useState } from 'react'
import type { Item, ItemQuery } from '../../api/contract'
import { ItemForm } from './ItemForm'
import { useDeleteItem, useItems } from './hooks'

const PAGE_SIZE = 10

export function ItemList() {
  const [query, setQuery] = useState<ItemQuery>({ page: 1, limit: PAGE_SIZE, sort: '-createdAt' })
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading, isError, error, isPlaceholderData, refetch } = useItems(query)
  const deleteItem = useDeleteItem()

  const updateQuery = (updates: {
    q?: string | null
    status?: ItemQuery['status'] | null
    rating?: ItemQuery['rating'] | null
    sort?: ItemQuery['sort']
  }) => {
    setQuery((current) => {
      const next = { ...current, page: 1 }
      if ('q' in updates) {
        if (updates.q) next.q = updates.q
        else delete next.q
      }
      if ('status' in updates) {
        if (updates.status) next.status = updates.status
        else delete next.status
      }
      if ('rating' in updates) {
        if (updates.rating) next.rating = updates.rating
        else delete next.rating
      }
      if (updates.sort) next.sort = updates.sort
      return next
    })
  }

  const openCreateForm = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const openEditForm = (item: Item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your items</h2>
          <p className="mt-1 text-sm text-slate-500">Keep track of what you are working on.</p>
        </div>
        <button className="rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900" onClick={openCreateForm} type="button">
          Add item
        </button>
      </div>

      <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="sr-only" htmlFor="filter-search">Search items</label>
        <input id="filter-search" className={filterClass} placeholder="Search titles…" value={query.q ?? ''} onChange={(event) => updateQuery({ q: event.target.value || null })} />
        <label className="sr-only" htmlFor="filter-status">Filter by status</label>
        <select id="filter-status" className={filterClass} value={query.status ?? ''} onChange={(event) => updateQuery({ status: event.target.value ? event.target.value as 'open' | 'done' : null })}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="done">Completed</option>
        </select>
        <label className="sr-only" htmlFor="filter-rating">Filter by rating</label>
        <select id="filter-rating" className={filterClass} value={query.rating ?? ''} onChange={(event) => updateQuery({ rating: event.target.value ? Number(event.target.value) as 1 | 2 | 3 | 4 | 5 : null })}>
          <option value="">All ratings</option>
          {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? '' : 's'}</option>)}
        </select>
        <label className="sr-only" htmlFor="filter-sort">Sort items</label>
        <select id="filter-sort" className={filterClass} value={query.sort ?? '-createdAt'} onChange={(event) => updateQuery({ sort: event.target.value as ItemQuery['sort'] })}>
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      {showForm && (
        <div className="border-b border-slate-200 bg-emerald-50/40 p-5 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editingItem ? 'Edit item' : 'Add an item'}</h3>
          <ItemForm {...(editingItem ? { item: editingItem } : {})} onCancel={closeForm} onSaved={closeForm} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 p-6" aria-label="Loading items">
          {[1, 2, 3].map((row) => <div className="h-20 animate-pulse rounded-xl bg-slate-100" key={row} />)}
        </div>
      ) : isError ? (
        <div className="p-8 text-center">
          <p className="text-sm text-rose-700" role="alert">Could not load items: {error.message}</p>
          <button className="mt-3 text-sm font-semibold text-emerald-800 underline" onClick={() => void refetch()} type="button">Try again</button>
        </div>
      ) : data?.items.length ? (
        <>
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <ul className="divide-y divide-slate-100">
              {data.items.map((item) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  onEdit={() => openEditForm(item)}
                  onDelete={() => deleteItem.mutate(item._id)}
                  isDeleting={deleteItem.isPending && deleteItem.variables === item._id}
                  deleteError={deleteItem.isError && deleteItem.variables === item._id ? deleteItem.error.message : undefined}
                />
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
            <span>{data.total} item{data.total === 1 ? '' : 's'} · Page {data.page} of {Math.max(1, data.totalPages)}</span>
            <div className="flex gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={query.page === 1 || isPlaceholderData} onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))} type="button">Previous</button>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!data.totalPages || data.page >= data.totalPages || isPlaceholderData} onClick={() => setQuery((current) => ({ ...current, page: (current.page ?? 1) + 1 }))} type="button">Next</button>
            </div>
          </div>
        </>
      ) : (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-xl text-emerald-800" aria-hidden="true">+</div>
          <h3 className="mt-4 font-semibold text-slate-900">{query.q || query.status || query.rating ? 'No matching items' : 'No items yet'}</h3>
          <p className="mt-1 text-sm text-slate-500">{query.q || query.status || query.rating ? 'Try changing your filters.' : 'Add your first item to get started.'}</p>
          {!query.q && !query.status && !query.rating && <button className="mt-4 text-sm font-semibold text-emerald-800 underline" onClick={openCreateForm} type="button">Create an item</button>}
        </div>
      )}
    </section>
  )
}

function ItemRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
  deleteError,
}: {
  item: Item
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  deleteError: string | undefined
}) {
  return (
    <li className="px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-slate-900">{item.title}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{item.status === 'done' ? 'Completed' : 'Open'}</span>
          </div>
          {item.description && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.description}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{item.rating ? `${item.rating} / 5 stars` : 'Unrated'}</span>
            <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time>
          </div>
          {deleteError && <p className="mt-2 text-sm text-rose-700" role="alert">{deleteError}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onEdit} type="button">Edit</button>
          <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50" disabled={isDeleting} onClick={onDelete} type="button">{isDeleting ? 'Removing…' : 'Delete'}</button>
        </div>
      </div>
    </li>
  )
}

const filterClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100'
