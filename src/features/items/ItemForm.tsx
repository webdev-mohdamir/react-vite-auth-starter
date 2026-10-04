import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Item } from '../../api/contract'
import { mapItemFormError } from './formErrors'
import { useCreateItem, useUpdateItem } from './hooks'

const itemSchema = z.object({
  title: z.string().trim().min(1, 'A title is required').max(120, 'Use 120 characters or fewer'),
  description: z.string().max(2000, 'Use 2000 characters or fewer'),
  status: z.enum(['open', 'done']),
  rating: z.string().refine((value) => value === '' || /^[1-5]$/.test(value), 'Choose a rating from 1 to 5'),
})

type ItemFormInput = z.input<typeof itemSchema>

interface ItemFormProps {
  item?: Item
  onCancel: () => void
  onSaved: () => void
}

export function ItemForm({ item, onCancel, onSaved }: ItemFormProps) {
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: item?.title ?? '',
      description: item?.description ?? '',
      status: item?.status ?? 'open',
      rating: item?.rating?.toString() ?? '',
    },
  })

  const isPending = isSubmitting || createItem.isPending || updateItem.isPending

  const onSubmit = async (values: ItemFormInput) => {
    setFormError('')
    const input = {
      title: values.title.trim(),
      status: values.status,
      ...(values.description ? { description: values.description } : {}),
      ...(values.rating ? { rating: Number(values.rating) } : {}),
    }

    try {
      if (item) {
        await updateItem.mutateAsync({ id: item._id, input })
      } else {
        await createItem.mutateAsync(input)
      }
      onSaved()
    } catch (error) {
      setFormError(mapItemFormError(error, setError))
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Title" error={errors.title?.message} htmlFor="item-title">
        <input
          id="item-title"
          className={inputClass}
          maxLength={120}
          {...register('title')}
          aria-invalid={Boolean(errors.title)}
        />
      </Field>
      <Field label="Description" error={errors.description?.message} htmlFor="item-description">
        <textarea
          id="item-description"
          className={inputClass}
          rows={3}
          maxLength={2000}
          {...register('description')}
          aria-invalid={Boolean(errors.description)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" error={errors.status?.message} htmlFor="item-status">
          <select id="item-status" className={inputClass} {...register('status')}>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </Field>
        <Field label="Rating (optional)" error={errors.rating?.message} htmlFor="item-rating">
          <select id="item-rating" className={inputClass} {...register('rating')}>
            <option value="">Not rated</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>{rating} star{rating === 1 ? '' : 's'}</option>
            ))}
          </select>
        </Field>
      </div>
      {formError && <p className="text-sm text-rose-700" role="alert">{formError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">
          {isPending ? 'Saving…' : item ? 'Save changes' : 'Create item'}
        </button>
      </div>
    </form>
  )
}

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100'

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string
  error: string | undefined
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-rose-700">{error}</p>}
    </div>
  )
}
