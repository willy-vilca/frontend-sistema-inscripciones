import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import { loginAdmin, saveAdminSession } from '../../services/adminAuthApi'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const session = await loginAdmin(form)
      saveAdminSession(session)
      navigate(location.state?.from ?? '/admin', { replace: true })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo iniciar sesion',
        text: error.response?.data?.message ?? 'Verifica tu usuario y clave.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-700 text-white">
            <ShieldCheck size={25} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Panel administrador
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Iniciar sesion</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Usuario</span>
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Clave</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <KeyRound size={18} aria-hidden="true" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-5 rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Usuario inicial: <b>admin</b> / Clave: <b>admin123</b>
        </div>

        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-700"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
