import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Swal from 'sweetalert2'
import { Ban, CheckCircle2, Download, Eye, Search, UsersRound } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  annulApplicant,
  approveApplicant,
  buildFileUrl,
  getApplicants,
  getApplicantsSummary,
} from '../../services/applicantsApi'

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

function statusLabel(value) {
  return value ? value.replaceAll('_', ' ') : '-'
}

export function AdminApplicantsPage() {
  const [summary, setSummary] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async (searchValue = search) => {
    setLoading(true)
    try {
      const [summaryData, applicantsData] = await Promise.all([
        getApplicantsSummary(),
        getApplicants(searchValue),
      ])
      setSummary(summaryData)
      setApplicants(applicantsData)
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar postulantes',
        text: 'Verifica que el backend este iniciado correctamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    Promise.all([getApplicantsSummary(), getApplicants('')])
      .then(([summaryData, applicantsData]) => {
        if (!active) return
        setSummary(summaryData)
        setApplicants(applicantsData)
      })
      .catch(() => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar postulantes',
          text: 'Verifica que el backend este iniciado correctamente.',
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    loadData(search)
  }

  const handleApprove = async (applicant) => {
    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Aprobar inscripcion',
      text: `Se marcara como aprobada la inscripcion de ${applicant.nombresCompletos}.`,
      showCancelButton: true,
      confirmButtonText: 'Si, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b91c1c',
    })

    if (!confirmation.isConfirmed) return

    try {
      await approveApplicant(applicant.id)
      await Swal.fire({
        icon: 'success',
        title: 'Inscripcion aprobada',
        text: 'El postulante ya figura como valido para rendir el examen.',
        confirmButtonColor: '#b91c1c',
      })
      loadData(search)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo aprobar',
        text: error.response?.data?.message ?? 'Intentalo nuevamente en unos segundos.',
      })
    }
  }

  const handleAnnul = async (applicant) => {
    const warningText =
      applicant.estado === 'APROBADA'
        ? 'Esta inscripcion ya estaba aprobada. Si la anulas, el pago quedara disponible para que el postulante pueda reinscribirse usando el mismo numero de movimiento.'
        : 'Al anularla, el pago quedara disponible para que el postulante pueda reinscribirse usando el mismo numero de movimiento.'

    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Anular inscripcion',
      text: warningText,
      input: 'textarea',
      inputLabel: 'Motivo de anulacion',
      inputPlaceholder: 'Describe claramente el motivo para que el postulante pueda corregirlo.',
      inputAttributes: {
        'aria-label': 'Motivo de anulacion',
      },
      showCancelButton: true,
      confirmButtonText: 'Anular inscripcion',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b91c1c',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debes ingresar el motivo de anulacion.'
        }
        return undefined
      },
    })

    if (!confirmation.isConfirmed) return

    try {
      await annulApplicant(applicant.id, confirmation.value.trim())
      await Swal.fire({
        icon: 'success',
        title: 'Inscripcion anulada',
        text: 'El motivo fue guardado y el pago quedo disponible para una nueva inscripcion.',
        confirmButtonColor: '#b91c1c',
      })
      loadData(search)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo anular',
        text: error.response?.data?.message ?? 'Intentalo nuevamente en unos segundos.',
      })
    }
  }

  return (
    <AdminLayout
      title="Postulantes inscritos"
      description="Consulta las inscripciones registradas, revisa la informacion completa del postulante y descarga sus documentos."
    >
      <div className="space-y-6">
        <SummaryCards summary={summary} />

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-slate-950">Inscripciones registradas</h3>
            <p className="text-sm text-slate-600">
              Se muestran hasta 100 registros. Puedes buscar por codigo, DNI, nombres o apellidos.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar postulante"
                className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800">
              Buscar
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Codigo</th>
                  <th className="px-5 py-3 font-bold">Postulante</th>
                  <th className="px-5 py-3 font-bold">Proceso</th>
                  <th className="px-5 py-3 font-bold">Carrera</th>
                  <th className="px-5 py-3 font-bold">Pago</th>
                  <th className="px-5 py-3 font-bold">Estado</th>
                  <th className="px-5 py-3 font-bold">Fecha</th>
                  <th className="px-5 py-3 font-bold">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan="8">
                      Cargando postulantes...
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan="8">
                      Todavia no hay postulantes registrados.
                    </td>
                  </tr>
                ) : (
                  applicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        {applicant.codigoPostulante}
                      </td>
                      <td className="max-w-[260px] px-5 py-4">
                        <p className="font-semibold text-slate-900">{applicant.nombresCompletos}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {applicant.tipoDocumento} {applicant.numeroDocumento}
                        </p>
                      </td>
                      <td className="max-w-[260px] px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">{applicant.procesoAdmision}</span>
                      </td>
                      <td className="max-w-[260px] px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">{applicant.carrera}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{applicant.nroMovimiento}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatMoney(applicant.importePagado)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={applicant.estado} />
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(applicant.fechaRegistro)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/postulantes/${applicant.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-700 hover:text-red-700"
                            title="Informacion del postulante"
                          >
                            <Eye size={17} aria-hidden="true" />
                          </Link>
                          <a
                            href={buildFileUrl(applicant.carneDownloadUrl)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-700 hover:text-red-700"
                            title="Descargar carne"
                          >
                            <Download size={17} aria-hidden="true" />
                          </a>
                          {applicant.estado === 'REGISTRADA' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(applicant)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 transition hover:border-emerald-600 hover:bg-emerald-50"
                              title="Aprobar inscripcion"
                            >
                              <CheckCircle2 size={17} aria-hidden="true" />
                            </button>
                          )}
                          {applicant.estado !== 'ANULADA' && (
                            <button
                              type="button"
                              onClick={() => handleAnnul(applicant)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-700 hover:bg-red-50"
                              title="Anular inscripcion"
                            >
                              <Ban size={17} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function StatusBadge({ status }) {
  const styles = {
    REGISTRADA: 'bg-amber-50 text-amber-700 ring-amber-200',
    APROBADA: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    ANULADA: 'bg-red-50 text-red-700 ring-red-200',
    BORRADOR: 'bg-slate-50 text-slate-700 ring-slate-200',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        styles[status] ?? styles.BORRADOR
      }`}
    >
      {statusLabel(status)}
    </span>
  )
}

function SummaryCards({ summary }) {
  const items = [
    ['Total', summary?.total ?? 0],
    ['Registradas', summary?.registradas ?? 0],
    ['Aprobadas', summary?.aprobadas ?? 0],
    ['Anuladas', summary?.anuladas ?? 0],
    ['Hoy', summary?.registradasHoy ?? 0],
  ]

  return (
    <section className="grid gap-4 md:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <UsersRound size={18} className="text-red-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
      ))}
    </section>
  )
}
