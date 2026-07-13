import { Link, Route, Routes } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  FileText,
  IdCard,
  LogIn,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react'
import { RequireAdminAuth } from './components/admin/RequireAdminAuth'
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminApplicantsPage } from './pages/admin/AdminApplicantsPage'
import { AdminApplicantDetailPage } from './pages/admin/AdminApplicantDetailPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminAcademicPage } from './pages/admin/AdminAcademicPage'
import { RegistrationStartPage } from './pages/registration/RegistrationStartPage'
import { ApplicationFormPlaceholderPage } from './pages/registration/ApplicationFormPlaceholderPage'
import { ApplicationConsultPage } from './pages/registration/ApplicationConsultPage'
import heroImage from './assets/hero.png'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inscripcion" element={<RegistrationStartPage />} />
      <Route path="/inscripcion/ficha" element={<ApplicationFormPlaceholderPage />} />
      <Route path="/inscripcion/consulta" element={<ApplicationConsultPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedAdmin><AdminDashboardPage /></ProtectedAdmin>} />
      <Route path="/admin/pagos" element={<ProtectedAdmin><AdminPaymentsPage /></ProtectedAdmin>} />
      <Route path="/admin/postulantes" element={<ProtectedAdmin><AdminApplicantsPage /></ProtectedAdmin>} />
      <Route path="/admin/postulantes/:id" element={<ProtectedAdmin><AdminApplicantDetailPage /></ProtectedAdmin>} />
      <Route path="/admin/academico" element={<ProtectedAdmin><AdminAcademicPage /></ProtectedAdmin>} />
      <Route path="/admin/usuarios" element={<ProtectedAdmin requiredRole="ADMIN"><AdminUsersPage /></ProtectedAdmin>} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

function ProtectedAdmin({ children, requiredRole }) {
  return <RequireAdminAuth requiredRole={requiredRole}>{children}</RequireAdminAuth>
}

function HomePage() {
  const applicationSteps = [
    {
      icon: CreditCard,
      title: 'Valida tu pago',
      description: 'Ingresa el numero de movimiento bancario para confirmar el pago de admision.',
    },
    {
      icon: FileText,
      title: 'Completa tu ficha',
      description: 'Registra tus datos personales, academicos y adjunta los documentos solicitados.',
    },
    {
      icon: IdCard,
      title: 'Obten tu carne',
      description: 'Al finalizar, descarga automaticamente tu carne de postulante en PDF.',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 text-white shadow-lg shadow-slate-950/20 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-red-700 text-white shadow-sm shadow-red-950/40">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
                Admision universitaria
              </p>
              <h1 className="text-lg font-bold text-white">
                Sistema de Inscripciones
              </h1>
            </div>
          </div>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/10"
          >
            <LogIn size={17} aria-hidden="true" />
            Administrador
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src={heroImage}
          alt=""
          className="absolute right-[-2rem] top-20 hidden h-[34rem] w-[34rem] object-contain opacity-20 lg:block"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-slate-950/82" />

        <div className="relative mx-auto grid min-h-[calc(100vh-77px)] w-full max-w-6xl content-center gap-10 px-5 py-16 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="max-w-3xl text-left">
            <p className="mb-4 text-sm font-semibold uppercase text-red-200">
              Proceso de admision 2026-I
            </p>
            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              Sistema de Inscripciones de Admision
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              Registra tu postulacion en linea, valida tu pago bancario,
              adjunta tus documentos y descarga tu carne digital al finalizar
              el proceso.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/inscripcion"
                className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
              >
                <UserRoundPlus size={18} aria-hidden="true" />
                Iniciar inscripcion
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                <ShieldCheck size={18} aria-hidden="true" />
                Acceso administrador
              </Link>
            </div>
          </div>

          <aside className="hidden text-left lg:block">
            <div className="border-l border-white/20 pl-8">
              <p className="text-sm font-semibold uppercase text-red-200">
                Atencion al postulante
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                Inscripcion guiada y carne digital
              </h3>
              <div className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
                <p>Validacion del pago bancario antes de abrir la ficha.</p>
                <p>Registro completo de datos personales y academicos.</p>
                <p>Emision automatica del carne de postulante en PDF.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <div className="mb-8 flex flex-col justify-between gap-3 text-left md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-red-700">
                Flujo de inscripcion
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Completa tu registro en tres pasos
              </h2>
            </div>
            <Link
              to="/inscripcion"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
            >
              Empezar ahora
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {applicationSteps.map((step) => {
              const StepIcon = step.icon

              return (
                <article
                  key={step.title}
                  className="rounded-md border border-slate-200 bg-slate-50 p-5 text-left"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-red-700 text-white">
                    <StepIcon size={21} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-10 text-left lg:grid-cols-2">
          <article className="flex flex-col justify-between gap-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-700 text-white">
                <FileSearch size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Consulta tu inscripcion
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Revisa el estado de tu registro, confirma tus datos principales
                  y descarga nuevamente tu carne digital.
                </p>
              </div>
            </div>
            <Link
              to="/inscripcion/consulta"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Consultar inscripcion
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>

          <article className="flex flex-col justify-between gap-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                <ClipboardCheck size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Gestion administrativa del proceso
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Los administradores y coordinadores pueden revisar postulantes,
                  pagos, procesos academicos y reportes de inscripcion desde su panel.
                </p>
              </div>
            </div>
            <Link
              to="/admin/login"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Entrar al panel
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
