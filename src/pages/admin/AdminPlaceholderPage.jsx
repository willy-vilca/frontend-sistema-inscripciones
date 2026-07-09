import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminPlaceholderPage() {
  return (
    <AdminLayout
      title="Panel administrador"
      description="Desde aqui puedes acceder a pagos, postulantes, configuracion academica y usuarios administradores segun tu rol."
    >
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Modulo en preparacion</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Desde el menu lateral puedes ingresar al modulo de pagos bancarios, listado
          de postulantes, configuracion academica y estadisticas de inscripciones.
        </p>
      </div>
    </AdminLayout>
  )
}
