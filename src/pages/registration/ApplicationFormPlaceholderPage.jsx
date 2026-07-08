import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PublicHeader } from '../../components/public/PublicHeader'

export function ApplicationFormPlaceholderPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <PublicHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-12">
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={30} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            Inicio validado correctamente
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            El documento y el pago fueron validados. En el siguiente modulo construiremos
            aqui la ficha completa de postulacion.
          </p>
          <Link
            to="/inscripcion"
            className="mt-6 inline-flex rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
          >
            Volver al inicio de inscripcion
          </Link>
        </div>
      </section>
    </main>
  )
}
