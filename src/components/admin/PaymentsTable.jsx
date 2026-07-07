import { format } from 'date-fns'

function formatDate(value) {
  if (!value) return '-'
  try {
    return format(new Date(value), 'dd/MM/yyyy HH:mm')
  } catch {
    return value
  }
}

function formatMoney(value) {
  if (value === null || value === undefined) return '-'
  return Number(value).toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN',
  })
}

export function PaymentsTable({ payments, loading }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-950">Ultimos pagos importados</h3>
        <p className="text-sm text-slate-600">
          Se muestran los 100 registros mas recientes guardados en la base de datos.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Nro Movimiento</th>
              <th className="px-5 py-3 font-bold">Cliente</th>
              <th className="px-5 py-3 font-bold">Descripcion</th>
              <th className="px-5 py-3 font-bold">Importe</th>
              <th className="px-5 py-3 font-bold">Fecha pago</th>
              <th className="px-5 py-3 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan="6">
                  Cargando pagos...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan="6">
                  Todavia no hay pagos importados.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-950">
                    {payment.nroMovimiento}
                  </td>
                  <td className="max-w-[240px] px-5 py-4 text-slate-700">
                    <span className="line-clamp-2">{payment.nombreCliente || '-'}</span>
                  </td>
                  <td className="max-w-[320px] px-5 py-4 text-slate-600">
                    <span className="line-clamp-2">{payment.descripcionPago || '-'}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {formatMoney(payment.importePagado)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(payment.fechaPago)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        payment.usado
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {payment.usado ? 'Usado' : 'Disponible'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
