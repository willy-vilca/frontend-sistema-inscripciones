import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Activity, ShieldCheck, UserRoundPlus } from 'lucide-react'
import { getApiStatus } from './services/api'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

function HomePage() {
  const [apiState, setApiState] = useState({
    loading: true,
    online: false,
    message: 'Verificando conexion con el backend...',
  })

  useEffect(() => {
    getApiStatus()
      .then((data) => {
        setApiState({
          loading: false,
          online: data.status === 'online',
          message: data.message,
        })
      })
      .catch(() => {
        setApiState({
          loading: false,
          online: false,
          message: 'No se pudo conectar con la API. Revisa que Spring Boot este iniciado.',
        })
      })
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-red-700 text-white">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Admision universitaria
              </p>
              <h1 className="text-lg font-bold text-slate-950">
                Sistema de Inscripciones
              </h1>
            </div>
          </div>
          <Link
            to="/admin/login"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
          >
            Administrador
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="text-left">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-700">
            Proceso de admision 2026-I
          </p>
          <h2 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
            Plataforma local para registrar postulantes y validar pagos bancarios.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Esta es la base tecnica inicial del proyecto. Desde aqui construiremos
            el flujo completo de inscripcion, carga de anexos, generacion del carne
            PDF y administracion de postulantes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inscripcion"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
            >
              <UserRoundPlus size={18} aria-hidden="true" />
              Iniciar inscripcion
            </Link>
            <a
              href="http://localhost:8080/api/status"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              <Activity size={18} aria-hidden="true" />
              Ver API
            </a>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6 text-left shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Estado del sistema</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                Conexion inicial
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                apiState.online
                  ? 'bg-emerald-100 text-emerald-700'
                  : apiState.loading
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {apiState.online ? 'Online' : apiState.loading ? 'Verificando' : 'Sin conexion'}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <StatusRow label="Frontend" value="React + Vite + TailwindCSS" ok />
            <StatusRow label="Backend" value="Spring Boot API REST" ok={apiState.online} />
            <StatusRow label="Base de datos" value="PostgreSQL: sistema_inscripciones" ok={apiState.online} />
          </div>

          <p className="mt-6 rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {apiState.message}
          </p>
        </div>
      </section>
    </main>
  )
}

function StatusRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          ok ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
        aria-label={ok ? 'Disponible' : 'Pendiente'}
      />
    </div>
  )
}

export default App
