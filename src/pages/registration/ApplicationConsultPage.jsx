import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileSearch,
  IdCard,
  Search,
  UserRoundCheck,
} from 'lucide-react'
import { PublicHeader } from '../../components/public/PublicHeader'
import { FormField } from '../../components/form/FormField'
import { inputClass } from '../../utils/styles'
import {
  consultApplication,
  downloadApplicantCard,
  getApplicationConsultCatalogs,
} from '../../services/registrationApi'

const initialForm = {
  procesoAdmisionId: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value).replaceAll('_', ' ')
}

function getStatusNotice(status) {
  if (status === 'APROBADA') {
    return {
      icon: CheckCircle2,
      title: 'Inscripcion aprobada',
      message: 'Tu inscripcion fue aprobada correctamente y se encuentra valida para rendir el examen de admision.',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      iconClassName: 'text-emerald-700',
    }
  }

  if (status === 'ANULADA') {
    return {
      icon: AlertCircle,
      title: 'Inscripcion anulada',
      message:
        'Tu inscripcion fue anulada. Revisa la observacion para conocer el motivo. Puedes volver a inscribirte corrigiendo ese detalle y usar el mismo numero de movimiento, sin realizar un nuevo pago al banco.',
      className: 'border-red-200 bg-red-50 text-red-900',
      iconClassName: 'text-red-700',
    }
  }

  return {
    icon: Clock3,
    title: 'Inscripcion pendiente de aprobacion',
    message: 'Tu inscripcion fue registrada y aun se encuentra pendiente de revision por el equipo de admision.',
    className: 'border-amber-200 bg-amber-50 text-amber-900',
    iconClassName: 'text-amber-700',
  }
}

export function ApplicationConsultPage() {
  const [catalogs, setCatalogs] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true

    getApplicationConsultCatalogs()
      .then((data) => {
        if (!active) return
        setCatalogs(data)
        setForm((current) => ({
          ...current,
          procesoAdmisionId: data.procesosAdmision?.[0]?.id?.toString() ?? '',
          tipoDocumento: data.tiposDocumento?.[0]?.value ?? 'DNI',
        }))
      })
      .catch(() => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar la consulta',
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

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setResult(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.procesoAdmisionId || !form.tipoDocumento || !form.numeroDocumento.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Selecciona el proceso e ingresa tu documento.',
      })
      return
    }

    setSearching(true)
    try {
      const data = await consultApplication({
        procesoAdmisionId: Number(form.procesoAdmisionId),
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento.trim(),
      })
      setResult(data)
    } catch (error) {
      setResult(null)
      Swal.fire({
        icon: 'info',
        title: 'Inscripcion no encontrada',
        text:
          error.response?.data?.message ??
          'No se encontro ninguna inscripcion con ese numero de documento en el proceso seleccionado.',
      })
    } finally {
      setSearching(false)
    }
  }

  const handleDownloadCard = async () => {
    if (!result?.carneDownloadUrl) return

    setDownloading(true)
    try {
      await downloadApplicantCard(result.carneDownloadUrl, `carne-${result.codigoPostulante}.pdf`)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo descargar el carne',
        text: error.response?.data?.message ?? 'Intentalo nuevamente en unos segundos.',
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <PublicHeader />

      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-red-700 text-white">
                  <FileSearch size={22} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Consulta de postulante
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    Revisa tu inscripcion
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Ingresa los datos usados en tu registro para ver el detalle y descargar nuevamente tu carne digital.
                  </p>
                </div>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              {loading ? (
                <div className="rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Cargando datos de consulta...
                </div>
              ) : (
                <>
                  <FormField label="Proceso de admision" required>
                    <select
                      value={form.procesoAdmisionId}
                      onChange={(event) => updateField('procesoAdmisionId', event.target.value)}
                      className={inputClass()}
                    >
                      {catalogs?.procesosAdmision?.map((proceso) => (
                        <option key={proceso.id} value={proceso.id}>
                          {proceso.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Tipo de documento" required>
                    <select
                      value={form.tipoDocumento}
                      onChange={(event) => updateField('tipoDocumento', event.target.value)}
                      className={inputClass()}
                    >
                      {catalogs?.tiposDocumento?.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Numero de documento" required>
                    <input
                      value={form.numeroDocumento}
                      onChange={(event) => updateField('numeroDocumento', event.target.value)}
                      className={inputClass()}
                      placeholder="Ingresa tu documento"
                    />
                  </FormField>

                  <button
                    type="submit"
                    disabled={searching}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Search size={18} aria-hidden="true" />
                    {searching ? 'Consultando...' : 'Consultar inscripcion'}
                  </button>
                </>
              )}
            </form>
          </section>

          {result ? (
            <ApplicationResult result={result} downloading={downloading} onDownload={handleDownloadCard} />
          ) : (
            <EmptyResult />
          )}
        </div>
      </section>
    </main>
  )
}

function EmptyResult() {
  return (
    <section className="flex min-h-[24rem] items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-slate-500">
          <IdCard size={28} aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">Detalle de inscripcion</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Cuando consultes una inscripcion valida, aqui veras los datos principales del registro y la opcion para descargar el carne digital.
        </p>
      </div>
    </section>
  )
}

function ApplicationResult({ result, downloading, onDownload }) {
  const notice = getStatusNotice(result.estado)
  const NoticeIcon = notice.icon
  const items = [
    ['Codigo de postulante', result.codigoPostulante],
    ['Documento', `${result.tipoDocumento} ${result.numeroDocumento}`],
    ['Proceso', result.procesoAdmision],
    ['Modalidad', result.modalidadAdmision],
    ['Tipo de colegio', result.tipoColegio],
    ['Area academica', result.areaAcademica],
    ['Carrera profesional', result.escuelaProfesional],
    ['Programa academico', result.programaAcademico],
    ['Nro. movimiento', result.nroMovimiento],
    ['Fecha de inscripcion', formatDate(result.fechaRegistro)],
    ['Estado', formatValue(result.estado)],
    ['Observaciones', result.observaciones],
  ]

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-600 text-white">
              <UserRoundCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Inscripcion encontrada
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-950">{result.nombresCompletos}</h3>
              <p className="mt-1 text-sm text-slate-600">
                Codigo {result.codigoPostulante}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Download size={17} aria-hidden="true" />
            {downloading ? 'Descargando...' : 'Descargar carne'}
          </button>
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className={`flex items-start gap-3 rounded-md border p-4 ${notice.className}`}>
          <NoticeIcon className={`mt-0.5 shrink-0 ${notice.iconClassName}`} size={22} aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">{notice.title}</p>
            <p className="mt-1 text-sm leading-6">{notice.message}</p>
          </div>
        </div>
      </div>

      <dl className="grid gap-4 p-6 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="border-b border-slate-100 pb-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
