import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { BarChart3, Edit, GraduationCap, Layers3, Plus, X } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  createAcademicArea,
  createAcademicProcess,
  createProfessionalCareer,
  getAcademicAreasAdmin,
  getAcademicProcesses,
  getAcademicStats,
  getProfessionalCareersAdmin,
  updateAcademicArea,
  updateAcademicProcess,
  updateProfessionalCareer,
} from '../../services/academicAdminApi'
import { getRegistrationCatalogs } from '../../services/registrationApi'

const tabs = [
  ['procesos', 'Procesos'],
  ['areas', 'Areas'],
  ['carreras', 'Carreras profesionales'],
  ['estadisticas', 'Estadisticas'],
]

const emptyProcess = {
  codigo: '',
  nombre: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  activo: true,
}

const emptyArea = {
  codigo: '',
  nombre: '',
  activo: true,
}

const emptyCareer = {
  areaAcademicaId: '',
  nombre: '',
  activo: true,
}

const emptyStatsFilters = {
  procesoId: '',
  modalidadId: '',
  areaId: '',
  escuelaId: '',
}

export function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState('procesos')
  const [processes, setProcesses] = useState([])
  const [areas, setAreas] = useState([])
  const [careers, setCareers] = useState([])
  const [modalities, setModalities] = useState([])
  const [stats, setStats] = useState(null)
  const [statsFilters, setStatsFilters] = useState(emptyStatsFilters)
  const [careerAreaFilter, setCareerAreaFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      getAcademicProcesses(),
      getAcademicAreasAdmin(),
      getProfessionalCareersAdmin(),
      getAcademicStats(emptyStatsFilters),
      getRegistrationCatalogs(),
    ])
      .then(([processData, areaData, careerData, statsData, catalogData]) => {
        if (!active) return
        setProcesses(processData)
        setAreas(areaData)
        setCareers(careerData)
        setStats(statsData)
        setModalities(catalogData.modalidadesAdmision ?? [])
      })
      .catch((error) => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar el modulo academico',
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

  const filteredCareers = useMemo(() => {
    if (!statsFilters.areaId) return careers
    return careers.filter((career) => String(career.areaAcademicaId) === String(statsFilters.areaId))
  }, [careers, statsFilters.areaId])

  const careersByArea = useMemo(() => {
    if (!careerAreaFilter) return careers
    return careers.filter((career) => String(career.areaAcademicaId) === String(careerAreaFilter))
  }, [careers, careerAreaFilter])

  const reloadAll = async () => {
    const [processData, areaData, careerData, statsData] = await Promise.all([
      getAcademicProcesses(),
      getAcademicAreasAdmin(),
      getProfessionalCareersAdmin(),
      getAcademicStats(statsFilters),
    ])
    setProcesses(processData)
    setAreas(areaData)
    setCareers(careerData)
    setStats(statsData)
  }

  const openCreate = (type) => {
    const initial = type === 'proceso' ? emptyProcess : type === 'area' ? emptyArea : emptyCareer
    setModal({ type, item: null, form: initial })
  }

  const openEdit = (type, item) => {
    if (type === 'proceso') {
      setModal({
        type,
        item,
        form: {
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion ?? '',
          fechaInicio: item.fechaInicio ?? '',
          fechaFin: item.fechaFin ?? '',
          activo: item.activo,
        },
      })
      return
    }

    if (type === 'area') {
      setModal({
        type,
        item,
        form: {
          codigo: item.codigo,
          nombre: item.nombre,
          activo: item.activo,
        },
      })
      return
    }

    setModal({
      type,
      item,
      form: {
        areaAcademicaId: item.areaAcademicaId,
        nombre: item.nombre,
        activo: item.activo,
      },
    })
  }

  const saveModal = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (modal.type === 'proceso') {
        const payload = {
          ...modal.form,
          fechaInicio: emptyToNull(modal.form.fechaInicio),
          fechaFin: emptyToNull(modal.form.fechaFin),
        }
        if (modal.item) {
          await updateAcademicProcess(modal.item.id, payload)
        } else {
          await createAcademicProcess(payload)
        }
      }

      if (modal.type === 'area') {
        if (modal.item) {
          await updateAcademicArea(modal.item.id, modal.form)
        } else {
          await createAcademicArea(modal.form)
        }
      }

      if (modal.type === 'carrera') {
        const payload = {
          ...modal.form,
          areaAcademicaId: Number(modal.form.areaAcademicaId),
        }
        if (modal.item) {
          await updateProfessionalCareer(modal.item.id, payload)
        } else {
          await createProfessionalCareer(payload)
        }
      }

      await Swal.fire({
        icon: 'success',
        title: 'Registro guardado',
        timer: 1200,
        showConfirmButton: false,
      })
      setModal(null)
      await reloadAll()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: error.response?.data?.message ?? 'Revisa los datos ingresados.',
      })
    } finally {
      setSaving(false)
    }
  }

  const loadStats = async (event) => {
    event?.preventDefault()
    try {
      setStats(await getAcademicStats(statsFilters))
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar estadisticas',
        text: error.response?.data?.message ?? 'Intentalo nuevamente.',
      })
    }
  }

  return (
    <AdminLayout
      title="Modulo academico"
      description="Gestiona procesos de admision, areas academicas, carreras profesionales y revisa estadisticas de inscripciones."
    >
      <div className="space-y-6">
        <section className="rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid gap-2 md:grid-cols-4">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-md px-4 py-3 text-sm font-bold transition ${
                  activeTab === key
                    ? 'bg-red-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando modulo academico...
          </section>
        ) : (
          <>
            {activeTab === 'procesos' ? (
              <ProcessesTab processes={processes} onCreate={() => openCreate('proceso')} onEdit={(item) => openEdit('proceso', item)} />
            ) : null}
            {activeTab === 'areas' ? (
              <AreasTab areas={areas} onCreate={() => openCreate('area')} onEdit={(item) => openEdit('area', item)} />
            ) : null}
            {activeTab === 'carreras' ? (
              <CareersTab
                careers={careersByArea}
                areas={areas}
                selectedArea={careerAreaFilter}
                onAreaChange={setCareerAreaFilter}
                onCreate={() => openCreate('carrera')}
                onEdit={(item) => openEdit('carrera', item)}
              />
            ) : null}
            {activeTab === 'estadisticas' ? (
              <StatsTab
                stats={stats}
                filters={statsFilters}
                setFilters={setStatsFilters}
                processes={processes}
                modalities={modalities}
                areas={areas}
                careers={filteredCareers}
                onSubmit={loadStats}
              />
            ) : null}
          </>
        )}

        {modal ? (
          <AcademicModal
            modal={modal}
            setModal={setModal}
            areas={areas}
            saving={saving}
            onSubmit={saveModal}
            onClose={() => setModal(null)}
          />
        ) : null}
      </div>
    </AdminLayout>
  )
}

function ProcessesTab({ processes, onCreate, onEdit }) {
  return (
    <CrudSection
      title="Procesos de admision"
      description="Administra codigos, nombres y rangos de fechas. Un proceso fuera de su rango aparece como no vigente."
      buttonText="Nuevo proceso"
      icon={Layers3}
      onCreate={onCreate}
    >
      <Table headers={['Codigo', 'Nombre', 'Fechas', 'Estado', 'Inscripciones', 'Opciones']} empty="No hay procesos registrados.">
        {processes.map((process) => (
          <tr key={process.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 font-semibold text-slate-950">{process.codigo}</td>
            <td className="max-w-[360px] px-5 py-4 text-slate-700">
              <p className="font-semibold text-slate-900">{process.nombre}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{process.descripcion || '-'}</p>
            </td>
            <td className="px-5 py-4 text-slate-600">
              {process.fechaInicio || '-'} / {process.fechaFin || '-'}
            </td>
            <td className="px-5 py-4">
              <StatusBadge active={process.estadoEfectivo} label={process.estadoEfectivo ? 'Vigente' : 'Inactivo'} />
            </td>
            <td className="px-5 py-4 font-semibold text-slate-800">{process.inscripciones}</td>
            <td className="px-5 py-4"><IconButton title="Editar proceso" onClick={() => onEdit(process)} /></td>
          </tr>
        ))}
      </Table>
    </CrudSection>
  )
}

function AreasTab({ areas, onCreate, onEdit }) {
  return (
    <CrudSection
      title="Areas academicas"
      description="Gestiona las areas que agrupan las carreras profesionales del proceso de admision."
      buttonText="Nueva area"
      icon={Layers3}
      onCreate={onCreate}
    >
      <Table headers={['Codigo', 'Nombre', 'Carreras', 'Inscripciones', 'Estado', 'Opciones']} empty="No hay areas registradas.">
        {areas.map((area) => (
          <tr key={area.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 font-semibold text-slate-950">{area.codigo}</td>
            <td className="px-5 py-4 text-slate-700">{area.nombre}</td>
            <td className="px-5 py-4 font-semibold text-slate-800">{area.carreras}</td>
            <td className="px-5 py-4 font-semibold text-slate-800">{area.inscripciones}</td>
            <td className="px-5 py-4"><StatusBadge active={area.activo} /></td>
            <td className="px-5 py-4"><IconButton title="Editar area" onClick={() => onEdit(area)} /></td>
          </tr>
        ))}
      </Table>
    </CrudSection>
  )
}

function CareersTab({ careers, areas, selectedArea, onAreaChange, onCreate, onEdit }) {
  return (
    <CrudSection
      title="Carreras profesionales"
      description="Gestiona las carreras asociadas a cada area academica. Cada carrera mantiene su programa academico vinculado."
      buttonText="Nueva carrera"
      icon={GraduationCap}
      onCreate={onCreate}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <label className="block max-w-sm">
          <span className="text-sm font-semibold text-slate-700">Filtrar por area academica</span>
          <select
            value={selectedArea}
            onChange={(event) => onAreaChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
          >
            <option value="">Todas las areas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.codigo} - {area.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Table headers={['Carrera', 'Area', 'Inscripciones', 'Estado', 'Opciones']} empty="No hay carreras para el area seleccionada.">
        {careers.map((career) => (
          <tr key={career.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 font-semibold text-slate-950">{career.nombre}</td>
            <td className="px-5 py-4 text-slate-600">
              <span className="font-semibold">{career.areaAcademicaCodigo}</span> - {career.areaAcademicaNombre}
            </td>
            <td className="px-5 py-4 font-semibold text-slate-800">{career.inscripciones}</td>
            <td className="px-5 py-4"><StatusBadge active={career.activo} /></td>
            <td className="px-5 py-4"><IconButton title="Editar carrera" onClick={() => onEdit(career)} /></td>
          </tr>
        ))}
      </Table>
    </CrudSection>
  )
}

function StatsTab({ stats, filters, setFilters, processes, modalities, areas, careers, onSubmit }) {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-950">Estadisticas de inscripciones</h3>
          <p className="text-sm text-slate-600">Combina filtros para ver el total exacto de inscritos.</p>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 p-5 md:grid-cols-5">
          <Select label="Proceso" value={filters.procesoId} onChange={(value) => setFilters((current) => ({ ...current, procesoId: value }))}>
            <option value="">Todos</option>
            {processes.map((process) => <option key={process.id} value={process.id}>{process.nombre}</option>)}
          </Select>
          <Select label="Modalidad" value={filters.modalidadId} onChange={(value) => setFilters((current) => ({ ...current, modalidadId: value }))}>
            <option value="">Todas</option>
            {modalities.map((modality) => <option key={modality.id} value={modality.id}>{modality.nombre}</option>)}
          </Select>
          <Select
            label="Area"
            value={filters.areaId}
            onChange={(value) => setFilters((current) => ({ ...current, areaId: value, escuelaId: '' }))}
          >
            <option value="">Todas</option>
            {areas.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}
          </Select>
          <Select label="Carrera" value={filters.escuelaId} onChange={(value) => setFilters((current) => ({ ...current, escuelaId: value }))}>
            <option value="">Todas</option>
            {careers.map((career) => <option key={career.id} value={career.id}>{career.nombre}</option>)}
          </Select>
          <button className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800">
            Aplicar filtros
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Total filtrado</p>
            <BarChart3 size={20} className="text-red-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-4xl font-bold text-slate-950">{stats?.totalFiltrado ?? 0}</p>
          <p className="mt-2 text-sm text-slate-600">Inscripciones que cumplen los filtros seleccionados.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <GroupTable title="Por proceso" rows={stats?.porProceso ?? []} />
          <GroupTable title="Por modalidad" rows={stats?.porModalidad ?? []} />
          <GroupTable title="Por area" rows={stats?.porArea ?? []} />
          <GroupTable title="Por carrera" rows={stats?.porCarrera ?? []} />
        </div>
      </section>
    </div>
  )
}

function AcademicModal({ modal, setModal, areas, saving, onSubmit, onClose }) {
  const title = modal.type === 'proceso'
    ? 'Proceso de admision'
    : modal.type === 'area'
      ? 'Area academica'
      : 'Carrera profesional'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-5 py-6">
      <section className="w-full max-w-2xl rounded-md bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">{modal.item ? `Editar ${title}` : `Nuevo ${title}`}</h3>
            <p className="text-sm text-slate-500">Completa la informacion requerida y guarda los cambios.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <form onSubmit={onSubmit} className="space-y-5 p-5">
          {modal.type === 'proceso' ? <ProcessFields modal={modal} setModal={setModal} /> : null}
          {modal.type === 'area' ? <AreaFields modal={modal} setModal={setModal} /> : null}
          {modal.type === 'carrera' ? <CareerFields modal={modal} setModal={setModal} areas={areas} /> : null}
          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:bg-slate-300">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function ProcessFields({ modal, setModal }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput label="Codigo" field="codigo" modal={modal} setModal={setModal} required />
      <TextInput label="Nombre" field="nombre" modal={modal} setModal={setModal} required />
      <TextInput label="Fecha inicio" field="fechaInicio" type="date" modal={modal} setModal={setModal} />
      <TextInput label="Fecha fin" field="fechaFin" type="date" modal={modal} setModal={setModal} />
      <label className="block md:col-span-2">
        <span className="text-sm font-semibold text-slate-700">Descripcion</span>
        <textarea
          value={modal.form.descripcion}
          onChange={(event) => updateModalField(setModal, 'descripcion', event.target.value)}
          className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
        />
      </label>
      <ActiveCheckbox modal={modal} setModal={setModal} />
    </div>
  )
}

function AreaFields({ modal, setModal }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInput label="Codigo" field="codigo" modal={modal} setModal={setModal} required />
      <TextInput label="Nombre" field="nombre" modal={modal} setModal={setModal} required />
      <ActiveCheckbox modal={modal} setModal={setModal} />
    </div>
  )
}

function CareerFields({ modal, setModal, areas }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Area academica</span>
        <select
          value={modal.form.areaAcademicaId}
          onChange={(event) => updateModalField(setModal, 'areaAcademicaId', event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
          required
        >
          <option value="">Seleccione un area</option>
          {areas.map((area) => <option key={area.id} value={area.id}>{area.codigo} - {area.nombre}</option>)}
        </select>
      </label>
      <TextInput label="Nombre de la carrera" field="nombre" modal={modal} setModal={setModal} required />
      <ActiveCheckbox modal={modal} setModal={setModal} />
    </div>
  )
}

function CrudSection({ title, description, buttonText, icon: Icon, onCreate, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 text-red-700">
            <Icon size={21} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800">
          <Plus size={18} aria-hidden="true" />
          {buttonText}
        </button>
      </div>
      {children}
    </section>
  )
}

function Table({ headers, empty, children }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children
  const emptyRows = Array.isArray(rows) && rows.length === 0
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-bold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {emptyRows ? (
            <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={headers.length}>{empty}</td></tr>
          ) : rows}
        </tbody>
      </table>
    </div>
  )
}

function GroupTable({ title, rows }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-bold text-slate-950">{title}</h4>
      <div className="mt-3 space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">Sin registros.</p>
        ) : rows.slice(0, 6).map((row) => (
          <div key={`${title}-${row.id}`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <span className="line-clamp-1 text-sm text-slate-600">{row.nombre}</span>
            <span className="font-bold text-slate-950">{row.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100">
        {children}
      </select>
    </label>
  )
}

function TextInput({ label, field, modal, setModal, type = 'text', required }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={modal.form[field]}
        onChange={(event) => updateModalField(setModal, field, event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
        required={required}
      />
    </label>
  )
}

function ActiveCheckbox({ modal, setModal }) {
  return (
    <label className="flex items-center gap-3 pt-8 text-sm font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={modal.form.activo}
        onChange={(event) => updateModalField(setModal, 'activo', event.target.checked)}
        className="h-5 w-5 accent-red-700"
      />
      Activo manualmente
    </label>
  )
}

function StatusBadge({ active, label }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
      {label ?? (active ? 'Activo' : 'Inactivo')}
    </span>
  )
}

function IconButton({ title, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-700 hover:text-red-700" title={title}>
      <Edit size={16} aria-hidden="true" />
    </button>
  )
}

function updateModalField(setModal, field, value) {
  setModal((current) => ({
    ...current,
    form: {
      ...current.form,
      [field]: value,
    },
  }))
}

function emptyToNull(value) {
  return value === '' ? null : value
}
