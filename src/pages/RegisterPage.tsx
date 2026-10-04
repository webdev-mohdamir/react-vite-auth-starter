import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../auth/useAuth'
import { mapAuthError } from '../auth/formErrors'

const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterValues) => {
    setFormError('')
    try {
      await createAccount(values)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(mapAuthError(error, setError))
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Get started</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
      <p className="mt-2 text-slate-600">A few details to set up your workspace.</p>
      <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            id="register-email"
            type="email"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
          />
          {errors.email && <p className="mt-1 text-sm text-rose-700" id="register-email-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-password">
            Password
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            id="register-password"
            type="password"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
          />
          {errors.password && <p className="mt-1 text-sm text-rose-700" id="register-password-error">{errors.password.message}</p>}
        </div>
        {formError && <p className="text-sm text-rose-700" role="alert">{formError}</p>}
        <button
          className="w-full rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered? <Link className="font-semibold text-emerald-800 hover:underline" to="/login">Sign in</Link>
      </p>
    </section>
  )
}
