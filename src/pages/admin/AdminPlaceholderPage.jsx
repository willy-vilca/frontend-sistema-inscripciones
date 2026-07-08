import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminPlaceholderPage() {
  return (
    <AdminLayout
      title="Panel administrador"
      description="Este panel se ira completando por modulos. Ya puedes administrar pagos bancarios y revisar postulantes inscritos."
    >
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Modulo en preparacion</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Desde el menu lateral puedes ingresar al modulo de pagos bancarios o al listado
          de postulantes inscritos. En las siguientes fases agregaremos login y gestion
          de usuarios administradores.
        </p>
      </div>
    </AdminLayout>
  )
}
