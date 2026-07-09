import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-red-700 text-white">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Admision universitaria
            </p>
            <h1 className="text-lg font-bold text-slate-950">Sistema de Inscripciones</h1>
          </div>
        </Link>

        <Link
          to="/admin"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
        >
          Administrador
        </Link>
      </div>
    </header>
  )
}
