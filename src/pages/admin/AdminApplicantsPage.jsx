import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Swal from 'sweetalert2'
import { Download, Eye, Search, UsersRound } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { buildFileUrl, getApplicants, getApplicantsSummary } from '../../services/applicantsApi'

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
                  <th className="px-5 py-3 font-bold">Fecha</th>
                  <th className="px-5 py-3 font-bold">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan="7">
                      Cargando postulantes...
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan="7">
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

function SummaryCards({ summary }) {
  const items = [
    ['Total', summary?.total ?? 0],
    ['Registradas', summary?.registradas ?? 0],
    ['Anuladas', summary?.anuladas ?? 0],
    ['Hoy', summary?.registradasHoy ?? 0],
  ]

  return (
    <section className="grid gap-4 md:grid-cols-4">
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
