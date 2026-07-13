import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'

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

export function PaymentsTable({
  payments,
  loading,
  searchTerm,
  statusFilter,
  totalLoaded,
  block,
  page,
  totalPages,
  rowsPerPage,
  canGoPrevious,
  canGoNext,
  onSearchTermChange,
  onSearch,
  onStatusChange,
  onClearFilters,
  onPreviousPage,
  onNextPage,
}) {
  const firstVisible = totalLoaded === 0 ? 0 : page * rowsPerPage + 1
  const lastVisible = totalLoaded === 0 ? 0 : page * rowsPerPage + payments.length

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Pagos bancarios registrados</h3>
            <p className="text-sm text-slate-600">
              Se muestran 5 pagos por pagina. Cada bloque carga hasta 100 resultados desde la
              base de datos.
            </p>
          </div>

          <form
            className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_180px_auto_auto]"
            onSubmit={onSearch}
          >
            <label className="relative">
              <span className="sr-only">Buscar pago</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
                aria-hidden="true"
              />
              <input
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Nro. movimiento o cliente"
              />
            </label>

            <label>
              <span className="sr-only">Estado del pago</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
                value={statusFilter}
                onChange={onStatusChange}
              >
                <option value="TODOS">Todos</option>
                <option value="DISPONIBLE">Disponibles</option>
                <option value="USADO">Usados</option>
              </select>
            </label>

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
              disabled={loading}
            >
              <Search size={17} aria-hidden="true" />
              Buscar
            </button>

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              type="button"
              onClick={onClearFilters}
              disabled={loading}
            >
              <X size={17} aria-hidden="true" />
              Limpiar
            </button>
          </form>
        </div>
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
                  No se encontraron pagos con los filtros seleccionados.
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

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-600">
          Bloque {block + 1} - Pagina {page + 1} de {totalPages} - Registros {firstVisible}-
          {lastVisible} de {totalLoaded} cargados
        </p>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
            onClick={onPreviousPage}
            disabled={loading || !canGoPrevious}
          >
            <ChevronLeft size={17} aria-hidden="true" />
            Anterior
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
            onClick={onNextPage}
            disabled={loading || !canGoNext}
          >
            Siguiente
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
