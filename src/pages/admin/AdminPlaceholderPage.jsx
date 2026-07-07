import { AdminLayout } from '../../components/admin/AdminLayout'

export function AdminPlaceholderPage() {
  return (
    <AdminLayout
      title="Panel administrador"
      description="Este panel se ira completando por modulos. El modulo activo por ahora es pagos bancarios."
    >
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Modulo en preparacion</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          En las siguientes fases agregaremos postulantes inscritos, detalle de informacion,
          documentos, carne PDF y gestion de usuarios administradores.
        </p>
      </div>
    </AdminLayout>
  )
}
