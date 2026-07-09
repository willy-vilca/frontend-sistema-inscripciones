import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft, Banknote, GraduationCap, LayoutDashboard, LogOut, UserCog, UsersRound } from 'lucide-react'
import { clearAdminSession, getStoredAdminSession } from '../../services/adminAuthApi'

const navItems = [
  { to: '/admin/pagos', label: 'Pagos bancarios', icon: Banknote },
  { to: '/admin/postulantes', label: 'Postulantes', icon: UsersRound },
  { to: '/admin/academico', label: 'Academico', icon: GraduationCap },
  { to: '/admin/usuarios', label: 'Usuarios admin', icon: UserCog, adminOnly: true },
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard },
]

export function AdminLayout({ title, description, children }) {
  const navigate = useNavigate()
  const session = getStoredAdminSession()

  const logout = () => {
    clearAdminSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-slate-950 p-5 text-white lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
            Panel administrador
          </p>
          <h1 className="mt-2 text-xl font-bold">Sistema de Inscripciones</h1>
        </div>

        <nav className="space-y-2">
          {navItems.filter((item) => !item.adminOnly || session?.user?.rol === 'ADMIN').map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-red-700 text-white'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="absolute bottom-20 left-5 right-5 rounded-md bg-slate-900 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sesion</p>
          <p className="mt-1 truncate text-sm font-bold text-white">
            {session?.user?.nombreCompleto ?? 'Administrador'}
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-600 hover:text-white"
          >
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesion
          </button>
        </div>

        <Link
          to="/"
          className="absolute bottom-5 left-5 right-5 flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Volver al inicio
        </Link>
      </aside>

      <section className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Administracion
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
              {description ? (
                <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
              ) : null}
            </div>
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700 lg:hidden"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Inicio
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
      </section>
    </main>
  )
}
