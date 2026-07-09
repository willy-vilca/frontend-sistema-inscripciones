import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  UsersRound,
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { getAcademicStats } from '../../services/academicAdminApi'
import { getApplicants, getApplicantsSummary } from '../../services/applicantsApi'
import { getPaymentsSummary } from '../../services/paymentsApi'

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

function percentage(value, total) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function AdminDashboardPage() {
  const [summary, setSummary] = useState({
    applicants: null,
    payments: null,
    stats: null,
    latestApplicants: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      getApplicantsSummary(),
      getPaymentsSummary(),
      getAcademicStats({}),
      getApplicants(''),
    ])
      .then(([applicants, payments, stats, latestApplicants]) => {
        if (!active) return
        setSummary({
          applicants,
          payments,
          stats,
          latestApplicants: latestApplicants.slice(0, 5),
        })
      })
      .catch((error) => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar el resumen',
          text: error.response?.data?.message ?? 'Verifica que el backend este iniciado correctamente.',
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const cards = [
    {
      label: 'Postulantes inscritos',
      value: summary.applicants?.registradas ?? 0,
      detail: `${summary.applicants?.registradasHoy ?? 0} registrados hoy`,
      icon: UsersRound,
      tone: 'bg-red-700 text-white',
    },
    {
      label: 'Pagos disponibles',
      value: summary.payments?.pagosDisponibles ?? 0,
      detail: `${summary.payments?.totalPagos ?? 0} pagos importados`,
      icon: CheckCircle2,
      tone: 'bg-emerald-600 text-white',
    },
    {
      label: 'Pagos utilizados',
      value: summary.payments?.pagosUsados ?? 0,
      detail: percentage(summary.payments?.pagosUsados ?? 0, summary.payments?.totalPagos ?? 0),
      icon: Clock3,
      tone: 'bg-slate-900 text-white',
    },
    {
      label: 'Total filtrado',
      value: summary.stats?.totalFiltrado ?? 0,
      detail: 'Inscripciones en estadisticas',
      icon: BarChart3,
      tone: 'bg-blue-700 text-white',
    },
  ]

  return (
    <AdminLayout
      title="Resumen general"
      description="Vista inicial con indicadores de inscripciones, pagos y distribucion academica del proceso."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {loading ? '-' : card.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{card.detail}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-md ${card.tone}`}>
                    <Icon size={22} aria-hidden="true" />
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <LatestApplicants applicants={summary.latestApplicants} loading={loading} />
          <QuickActions />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <RankingPanel
            title="Carreras con mayor demanda"
            icon={GraduationCap}
            rows={summary.stats?.porCarrera ?? []}
            loading={loading}
          />
          <RankingPanel
            title="Inscripciones por proceso"
            icon={LayoutDashboard}
            rows={summary.stats?.porProceso ?? []}
            loading={loading}
          />
        </section>
      </div>
    </AdminLayout>
  )
}

function LatestApplicants({ applicants, loading }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Ultimas inscripciones</h3>
          <p className="text-sm text-slate-600">Postulantes registrados recientemente.</p>
        </div>
        <Link
          to="/admin/postulantes"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
        >
          Ver todos
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Codigo</th>
              <th className="px-5 py-3 font-bold">Postulante</th>
              <th className="px-5 py-3 font-bold">Carrera</th>
              <th className="px-5 py-3 font-bold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan="4">
                  Cargando inscripciones...
                </td>
              </tr>
            ) : applicants.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan="4">
                  Todavia no hay postulantes registrados.
                </td>
              </tr>
            ) : (
              applicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-950">{applicant.codigoPostulante}</td>
                  <td className="max-w-[260px] px-5 py-4">
                    <p className="line-clamp-1 font-semibold text-slate-900">{applicant.nombresCompletos}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {applicant.tipoDocumento} {applicant.numeroDocumento}
                    </p>
                  </td>
                  <td className="max-w-[260px] px-5 py-4 text-slate-600">
                    <span className="line-clamp-1">{applicant.carrera}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(applicant.fechaRegistro)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function QuickActions() {
  const actions = [
    {
      to: '/admin/pagos',
      title: 'Importar pagos',
      description: 'Carga el Excel del banco y revisa movimientos usados.',
      icon: FileSpreadsheet,
    },
    {
      to: '/admin/postulantes',
      title: 'Revisar postulantes',
      description: 'Consulta fichas, anexos, pagos y carne digital.',
      icon: IdCard,
    },
    {
      to: '/admin/academico',
      title: 'Gestion academica',
      description: 'Administra procesos, areas, carreras y estadisticas.',
      icon: GraduationCap,
    },
  ]

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">Accesos rapidos</h3>
      <p className="mt-1 text-sm text-slate-600">Operaciones frecuentes del panel administrativo.</p>
      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-4 rounded-md border border-slate-200 p-4 transition hover:border-red-200 hover:bg-red-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-700 text-white">
                <Icon size={21} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-950">{action.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{action.description}</p>
              </div>
              <ArrowRight size={17} className="text-slate-400" aria-hidden="true" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function RankingPanel({ title, icon: Icon, rows, loading }) {
  const visibleRows = rows.slice(0, 6)

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <Icon size={21} className="text-red-700" aria-hidden="true" />
      </div>
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando datos...</p>
        ) : visibleRows.length === 0 ? (
          <p className="text-sm text-slate-500">Sin registros para mostrar.</p>
        ) : (
          visibleRows.map((row) => (
            <div key={`${title}-${row.id ?? row.nombre}`} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <span className="line-clamp-1 text-sm font-semibold text-slate-700">{row.nombre}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-950">{row.total}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
