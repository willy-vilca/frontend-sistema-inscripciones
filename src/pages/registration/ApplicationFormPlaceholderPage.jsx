import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Camera, Save } from 'lucide-react'
import { PublicHeader } from '../../components/public/PublicHeader'
import { FormField } from '../../components/form/FormField'
import { FormSection } from '../../components/form/FormSection'
import { FilePicker } from '../../components/form/FilePicker'
import { inputClass } from '../../utils/styles'
import {
  downloadApplicantCard,
  getAcademicAreas,
  getAcademicPrograms,
  getProfessionalSchools,
  registerApplication,
} from '../../services/registrationApi'

const commonDocuments = {
  dni: {
    key: 'dni',
    label: 'Documento Nacional de Identidad - Actualizado',
    required: true,
  },
  documentoIdentidadGeneral: {
    key: 'documento_identidad',
    label: 'Documento Nacional de Identidad, Carnet de Extranjeria o Pasaporte',
    required: true,
  },
  certificadoOrdinario: {
    key: 'certificado_estudios',
    label: 'Certificado de Estudios Secundarios o Constancia de Logros de aprendizaje, con las calificaciones aprobatorias, o Constancia de estar cursando 5to ano de educacion secundaria.',
    required: true,
  },
  certificadoCompleto: {
    key: 'certificado_estudios_completo',
    label: 'Certificado de estudios del 1ro al 5to ano de secundaria o constancia de logros de aprendizaje con las calificaciones aprobatorias, expedido por el director de la Institucion Educativa',
    required: true,
  },
  compromisoCertificado: {
    key: 'compromiso_certificado',
    label: 'Compromiso de entregar certificado de estudios en caso de ingresar (Solo para estudiantes de 5to ano de educacion secundaria)',
    required: false,
  },
  antecedentes: {
    key: 'declaracion_antecedentes',
    label: 'Declaracion Jurada de no tener antecedentes penales',
    required: true,
  },
  veracidad: {
    key: 'declaracion_veracidad',
    label: 'Declaracion Jurada de veracidad de la documentacion',
    required: true,
  },
}

const modalityDocumentRequirements = {
  1: [
    commonDocuments.dni,
    commonDocuments.certificadoOrdinario,
    commonDocuments.compromisoCertificado,
    commonDocuments.antecedentes,
    commonDocuments.veracidad,
  ],
  3: [
    commonDocuments.dni,
    commonDocuments.certificadoCompleto,
    {
      key: 'victima_terrorismo',
      label: 'Copia fedateada de la Resolucion o Certificado que acredite fehacientemente su condicion de victima de terrorismo, expedida por el Consejo Regional de Calificacion',
      required: true,
    },
    commonDocuments.antecedentes,
    commonDocuments.veracidad,
  ],
  4: [
    commonDocuments.documentoIdentidadGeneral,
    {
      key: 'titulo_profesional',
      label: 'Titulo Profesional universitario o de Instituciones con rango universitario reconocido por ley, o copia legalizada del grado academico o titulo profesional revalidado por una universidad peruana (solo extranjero)',
      required: true,
    },
    commonDocuments.antecedentes,
    commonDocuments.veracidad,
  ],
  5: [
    commonDocuments.dni,
    commonDocuments.certificadoCompleto,
    {
      key: 'certificado_discapacidad',
      label: 'Certificado de discapacidad emitido por los hospitales de los Ministerios de Salud, de Defensa y del Interior, y el Seguro Social de Salud (EsSalud) original o legalizado',
      required: true,
    },
    commonDocuments.antecedentes,
    commonDocuments.veracidad,
  ],
  6: [
    commonDocuments.dni,
    commonDocuments.certificadoCompleto,
    {
      key: 'carta_presentacion_ipd',
      label: 'Carta de presentacion del presidente Instituto Peruano del Deporte (IPD) que certifique al postulante como deportista destacado, con una antiguedad no mayor a un (01) ano',
      required: true,
    },
    {
      key: 'constancia_no_sancion_deportiva',
      label: 'Constancia expedida por el IPD o la federacion deportiva nacional que acredite no haber sido sancionado por falta grave o actividades antideportivas',
      required: true,
    },
    {
      key: 'compromiso_deportivo',
      label: 'Compromiso notarial de representar a la universidad en todas las competencias deportivas de su especialidad durante su permanencia en la institucion',
      required: true,
    },
    commonDocuments.antecedentes,
    commonDocuments.veracidad,
  ],
  7: [
    commonDocuments.dni,
    {
      key: 'certificado_estudios_primero_quinto',
      label: 'Certificado de estudios del 1ro al 5to ano de secundaria',
      required: true,
    },
    {
      key: 'constancia_primeros_puestos',
      label: 'Constancia de haber ocupado uno de los dos (2) primeros puestos en el orden de merito en educacion basica regular o educacion basica alternativa (La validez de la constancia es por dos anos posteriores al egreso)',
      required: true,
    },
    commonDocuments.antecedentes,
    commonDocuments.veracidad,
  ],
}

const initialForm = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  sexo: 'NO_ESPECIFICA',
  fechaNacimiento: '',
  edad: 0,
  estadoCivil: 'SOLTERO',
  numeroHijos: 0,
  procedencia: 'Peru',
  paisNacimiento: 'Peru',
  departamentoNacimiento: '',
  provinciaNacimiento: '',
  distritoNacimiento: '',
  departamentoDomicilio: '',
  provinciaDomicilio: '',
  distritoDomicilio: '',
  direccion: '',
  correoElectronico: '',
  telefono1: '',
  telefono2: '',
  trabaja: false,
  ocupacion: '',
  condicionLaboral: '',
  institucionEmpresa: '',
  tipoApoderado: 'NINGUNO',
  apoderadoNombreCompleto: '',
  apoderadoRelacion: '',
  apoderadoOcupacion: '',
  apoderadoCentroLaboral: '',
  apoderadoTelefono: '',
  apoderadoCorreo: '',
  tipoEducacionSecundaria: 'PUBLICO',
  estudiosConcluidos: 'SI',
  colegioDepartamento: '',
  colegioProvincia: '',
  institucionEducativa: '',
  periodoEstudioInicio: '',
  periodoEstudioFin: '',
  presentaDiscapacidad: false,
  discapacidadDetalle: '',
  preparacionUniversitaria: 'Academica Particular',
  medioDifusion: 'INTERNET',
  medioDifusionOtro: '',
  areaAcademicaId: '',
  escuelaProfesionalId: '',
  programaAcademicoId: '',
  aceptaTerminos: false,
}

export function ApplicationFormPlaceholderPage() {
  const navigate = useNavigate()
  const [inicio] = useState(() => {
    const raw = sessionStorage.getItem('inicioInscripcion')
    return raw ? JSON.parse(raw) : null
  })
  const [form, setForm] = useState(initialForm)
  const [photo, setPhoto] = useState(null)
  const [documents, setDocuments] = useState({})
  const [areas, setAreas] = useState([])
  const [schools, setSchools] = useState([])
  const [programs, setPrograms] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const documentRequirements = useMemo(
    () => getDocumentRequirements(inicio?.modalidadAdmision),
    [inicio?.modalidadAdmision],
  )

  useEffect(() => {
    if (!inicio) {
      navigate('/inscripcion')
    }
  }, [inicio, navigate])

  useEffect(() => {
    getAcademicAreas().then(setAreas).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar areas',
        text: 'Verifica que el backend este iniciado.',
      })
    })
  }, [])

  useEffect(() => {
    if (!form.areaAcademicaId) {
      return
    }
    getProfessionalSchools(form.areaAcademicaId).then((data) => {
      setSchools(data)
    })
  }, [form.areaAcademicaId])

  useEffect(() => {
    if (!form.escuelaProfesionalId) {
      return
    }
    getAcademicPrograms(form.escuelaProfesionalId).then((data) => {
      setPrograms(data)
    })
  }, [form.escuelaProfesionalId])

  const photoPreview = useMemo(() => {
    if (!photo) return null
    return URL.createObjectURL(photo)
  }, [photo])

  const updateField = (field, value) => {
    if (field === 'areaAcademicaId') {
      setSchools([])
      setPrograms([])
      setForm((current) => ({
        ...current,
        areaAcademicaId: value,
        escuelaProfesionalId: '',
        programaAcademicoId: '',
      }))
      return
    }

    if (field === 'escuelaProfesionalId') {
      setPrograms([])
      setForm((current) => ({
        ...current,
        escuelaProfesionalId: value,
        programaAcademicoId: '',
      }))
      return
    }

    setForm((current) => {
      return { ...current, [field]: value }
    })
  }

  const updateDocument = (key, file) => {
    setDocuments((current) => ({ ...current, [key]: file }))
  }

  const handleBirthDate = (value) => {
    updateField('fechaNacimiento', value)
    if (!value) return

    const birthDate = new Date(`${value}T00:00:00`)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1
    }
    updateField('edad', Math.max(age, 0))
  }

  const validateBeforeSubmit = () => {
    const requiredFields = [
      ['nombres', 'Nombres'],
      ['apellidoPaterno', 'Apellido paterno'],
      ['fechaNacimiento', 'Fecha de nacimiento'],
      ['direccion', 'Direccion'],
      ['correoElectronico', 'Correo electronico'],
      ['telefono1', 'Telefono 1'],
      ['institucionEducativa', 'Institucion educativa'],
      ['areaAcademicaId', 'Area academica'],
      ['escuelaProfesionalId', 'Escuela profesional'],
      ['programaAcademicoId', 'Programa academico'],
    ]

    const missing = requiredFields.find(([field]) => !form[field])
    if (missing) {
      Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: `Completa: ${missing[1]}.` })
      return false
    }

    if (!photo) {
      Swal.fire({ icon: 'warning', title: 'Fotografia requerida', text: 'Debes adjuntar la fotografia del postulante.' })
      return false
    }

    const missingDocument = documentRequirements.find((document) => document.required && !documents[document.key])
    if (missingDocument) {
      Swal.fire({ icon: 'warning', title: 'Documento obligatorio', text: `Adjunta: ${missingDocument.label}.` })
      return false
    }

    if (!form.aceptaTerminos) {
      Swal.fire({ icon: 'warning', title: 'Terminos y condiciones', text: 'Debes aceptar la declaracion de responsabilidad.' })
      return false
    }

    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!inicio || !validateBeforeSubmit()) return

    setSubmitting(true)
    try {
      const result = await registerApplication(
        buildPayload(inicio, form, documentRequirements),
        photo,
        pickRequirementFiles(documents, documentRequirements),
      )
      await downloadApplicantCard(result.carneDownloadUrl, `carne-${result.codigoPostulante}.pdf`)
      await Swal.fire({
        icon: 'success',
        title: 'Inscripcion registrada',
        html: `<p>${result.mensaje}</p><p>Tu carne digital fue descargado correctamente.</p><p><b>Codigo:</b> ${result.codigoPostulante}</p>`,
      })
      sessionStorage.removeItem('inicioInscripcion')
      navigate('/inscripcion')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo registrar',
        text: error.response?.data?.message ?? 'Revisa los datos ingresados e intenta nuevamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!inicio) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <PublicHeader />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <PublicHeader />

      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-6 py-6 text-center">
            <p className="text-sm text-slate-600">
              Periodo de Admision <b>{inicio.procesoAdmision?.nombre}</b>
            </p>
            <h2 className="mt-1 text-3xl font-bold text-slate-950">Ficha de Postulacion</h2>
          </header>

          <FormSection title="Fotografia formal en formato digital">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500">
                {photoPreview ? <img src={photoPreview} alt="Vista previa" className="h-full w-full object-cover" /> : <Camera size={54} aria-hidden="true" />}
              </div>
              <div className="mt-5">
                <FilePicker label="Registra tu fotografia" accept="image/*" file={photo} onChange={setPhoto} required />
              </div>
            </div>
          </FormSection>

          <FormSection title="Datos Personales">
            <div className="grid gap-5 md:grid-cols-3">
              <TextInput label="Nombres" field="nombres" form={form} updateField={updateField} required />
              <TextInput label="Apellido Paterno" field="apellidoPaterno" form={form} updateField={updateField} required />
              <TextInput label="Apellido Materno" field="apellidoMaterno" form={form} updateField={updateField} />
              <ReadonlyInput label="Tipo de documento" value={inicio.tipoDocumento} />
              <ReadonlyInput label="Nro. documento" value={inicio.numeroDocumento} />
              <FormField label="Sexo" required>
                <select className={inputClass()} value={form.sexo} onChange={(e) => updateField('sexo', e.target.value)}>
                  <option value="NO_ESPECIFICA">No especifica</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </FormField>
              <FormField label="Fecha de nacimiento" required>
                <input type="date" className={inputClass()} value={form.fechaNacimiento} onChange={(e) => handleBirthDate(e.target.value)} />
              </FormField>
              <ReadonlyInput label="Edad" value={form.edad} />
              <FormField label="Estado Civil">
                <select className={inputClass()} value={form.estadoCivil} onChange={(e) => updateField('estadoCivil', e.target.value)}>
                  <option value="SOLTERO">Soltero</option>
                  <option value="CASADO">Casado</option>
                  <option value="CONVIVIENTE">Conviviente</option>
                  <option value="DIVORCIADO">Divorciado</option>
                  <option value="VIUDO">Viudo</option>
                </select>
              </FormField>
              <FormField label="Nro de hijos">
                <input type="number" min="0" className={inputClass()} value={form.numeroHijos} onChange={(e) => updateField('numeroHijos', Number(e.target.value))} />
              </FormField>
              <TextInput label="Procedencia" field="procedencia" form={form} updateField={updateField} />
            </div>
          </FormSection>

          <FormSection title="Lugar de Nacimiento">
            <div className="grid gap-5 md:grid-cols-4">
              <TextInput label="Pais" field="paisNacimiento" form={form} updateField={updateField} />
              <TextInput label="Departamento" field="departamentoNacimiento" form={form} updateField={updateField} />
              <TextInput label="Provincia" field="provinciaNacimiento" form={form} updateField={updateField} />
              <TextInput label="Distrito" field="distritoNacimiento" form={form} updateField={updateField} />
            </div>
          </FormSection>

          <FormSection title="Direccion Domiciliaria Actual">
            <div className="grid gap-5 md:grid-cols-3">
              <TextInput label="Departamento" field="departamentoDomicilio" form={form} updateField={updateField} />
              <TextInput label="Provincia" field="provinciaDomicilio" form={form} updateField={updateField} />
              <TextInput label="Distrito" field="distritoDomicilio" form={form} updateField={updateField} />
            </div>
            <div className="mt-5">
              <TextInput label="Direccion" field="direccion" form={form} updateField={updateField} required />
            </div>
          </FormSection>

          <FormSection title="Informacion de Contacto">
            <div className="grid gap-5 md:grid-cols-3">
              <TextInput label="Correo electronico" field="correoElectronico" type="email" form={form} updateField={updateField} required />
              <TextInput label="Telefono 1" field="telefono1" form={form} updateField={updateField} required />
              <TextInput label="Telefono 2" field="telefono2" form={form} updateField={updateField} />
            </div>
          </FormSection>

          <FormSection title="Ocupacion">
            <label className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.trabaja} onChange={(e) => updateField('trabaja', e.target.checked)} className="h-4 w-4 accent-red-700" />
              Se encuentra trabajando
            </label>
            <div className="grid gap-5 md:grid-cols-3">
              <TextInput label="Ocupacion" field="ocupacion" form={form} updateField={updateField} disabled={!form.trabaja} />
              <TextInput label="Condicion laboral" field="condicionLaboral" form={form} updateField={updateField} disabled={!form.trabaja} />
              <TextInput label="Institucion o Empresa" field="institucionEmpresa" form={form} updateField={updateField} disabled={!form.trabaja} />
            </div>
          </FormSection>

          <FormSection title="Familiares y/o Apoderado">
            <div className="mb-5 flex flex-wrap gap-4">
              {['NINGUNO', 'MADRE', 'PADRE', 'OTRO'].map((option) => (
                <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" value={option} checked={form.tipoApoderado === option} onChange={(e) => updateField('tipoApoderado', e.target.value)} className="h-4 w-4 accent-red-700" />
                  {option}
                </label>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <TextInput label="Nombre completo" field="apoderadoNombreCompleto" form={form} updateField={updateField} />
              <TextInput label="Relacion" field="apoderadoRelacion" form={form} updateField={updateField} />
              <TextInput label="Ocupacion" field="apoderadoOcupacion" form={form} updateField={updateField} />
              <TextInput label="Centro laboral" field="apoderadoCentroLaboral" form={form} updateField={updateField} />
              <TextInput label="Telefono" field="apoderadoTelefono" form={form} updateField={updateField} />
              <TextInput label="Correo electronico" field="apoderadoCorreo" form={form} updateField={updateField} />
            </div>
          </FormSection>

          <FormSection title="Estudios de Educacion Secundaria">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Tipo de educacion">
                <select className={inputClass()} value={form.tipoEducacionSecundaria} onChange={(e) => updateField('tipoEducacionSecundaria', e.target.value)}>
                  <option value="PUBLICO">Publico</option>
                  <option value="PRIVADO">Privado</option>
                  <option value="EXTRANJERO">Extranjero</option>
                </select>
              </FormField>
              <FormField label="Estudios concluidos">
                <select className={inputClass()} value={form.estudiosConcluidos} onChange={(e) => updateField('estudiosConcluidos', e.target.value)}>
                  <option value="SI">Si</option>
                  <option value="NO_CURSANDO_QUINTO">No, cursando 5to ano</option>
                  <option value="OTROS_CASOS">Otros casos</option>
                </select>
              </FormField>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <TextInput label="Departamento" field="colegioDepartamento" form={form} updateField={updateField} />
              <TextInput label="Provincia" field="colegioProvincia" form={form} updateField={updateField} />
              <TextInput label="Institucion educativa" field="institucionEducativa" form={form} updateField={updateField} required />
              <TextInput label="Inicio" field="periodoEstudioInicio" type="number" form={form} updateField={updateField} />
              <TextInput label="Fin" field="periodoEstudioFin" type="number" form={form} updateField={updateField} />
            </div>
          </FormSection>

          <FormSection title="Informacion Adicional">
            <label className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.presentaDiscapacidad} onChange={(e) => updateField('presentaDiscapacidad', e.target.checked)} className="h-4 w-4 accent-red-700" />
              Presenta alguna discapacidad
            </label>
            <TextInput label="Detalle de discapacidad" field="discapacidadDetalle" form={form} updateField={updateField} disabled={!form.presentaDiscapacidad} />
            <div className="mt-5">
              <TextInput label="Preparacion universitaria" field="preparacionUniversitaria" form={form} updateField={updateField} />
            </div>
          </FormSection>

          <FormSection title="Datos de Postulacion">
            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Medio de difusion">
                <select className={inputClass()} value={form.medioDifusion} onChange={(e) => updateField('medioDifusion', e.target.value)}>
                  <option value="INTERNET">Internet</option>
                  <option value="REDES_SOCIALES">Redes Sociales</option>
                  <option value="FAMILIA_AMIGOS">Familia y/o amigos</option>
                  <option value="OTRO">Otro</option>
                </select>
              </FormField>
              <TextInput label="Otro medio" field="medioDifusionOtro" form={form} updateField={updateField} disabled={form.medioDifusion !== 'OTRO'} />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <FormField label="Area Academica" required>
                <select className={inputClass()} value={form.areaAcademicaId} onChange={(e) => updateField('areaAcademicaId', e.target.value)}>
                  <option value="">Seleccione un area</option>
                  {areas.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Escuela Profesional" required>
                <select className={inputClass()} value={form.escuelaProfesionalId} onChange={(e) => updateField('escuelaProfesionalId', e.target.value)} disabled={!form.areaAcademicaId}>
                  <option value="">Seleccione una escuela</option>
                  {schools.map((school) => <option key={school.id} value={school.id}>{school.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Programa Academico" required>
                <select className={inputClass()} value={form.programaAcademicoId} onChange={(e) => updateField('programaAcademicoId', e.target.value)} disabled={!form.escuelaProfesionalId}>
                  <option value="">Seleccione un programa</option>
                  {programs.map((program) => <option key={program.id} value={program.id}>{program.nombre}</option>)}
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Lista de requisitos anexos">
            <div className="grid gap-6 md:grid-cols-2">
              {documentRequirements.map((document) => (
                <FilePicker
                  key={document.key}
                  label={document.label}
                  accept="application/pdf"
                  file={documents[document.key]}
                  onChange={(file) => updateDocument(document.key, file)}
                  required={document.required}
                />
              ))}
            </div>

            <div className="mt-8 rounded-md bg-sky-600 px-5 py-4 text-sm leading-6 text-white">
              <b>IMPORTANTE:</b> La informacion consignada al momento de inscribirme es verdadera
              y de mi entera responsabilidad. En caso de alcanzar una vacante, asumo la responsabilidad
              de cumplir con la entrega de documentacion original en el plazo establecido.
            </div>

            <label className="mt-6 inline-flex items-center gap-3 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={form.aceptaTerminos} onChange={(e) => updateField('aceptaTerminos', e.target.checked)} className="h-5 w-5 accent-red-700" />
              Acepto los Terminos y Condiciones
            </label>
          </FormSection>

          <footer className="flex justify-end border-t border-slate-200 px-6 py-6">
            <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-orange-600 px-7 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              <Save size={18} aria-hidden="true" />
              {submitting ? 'Registrando...' : 'Registrar Inscripcion'}
            </button>
          </footer>
        </form>
      </section>
    </main>
  )
}

function TextInput({ label, field, form, updateField, type = 'text', required, disabled }) {
  return (
    <FormField label={label} required={required}>
      <input type={type} className={inputClass(disabled ? 'bg-slate-100' : '')} value={form[field]} onChange={(e) => updateField(field, e.target.value)} disabled={disabled} />
    </FormField>
  )
}

function ReadonlyInput({ label, value }) {
  return (
    <FormField label={label}>
      <input className={inputClass('bg-slate-100')} value={value} readOnly />
    </FormField>
  )
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

function emptyToNull(value) {
  return value === '' ? null : value
}

function getDocumentRequirements(modalidad) {
  const modalityId = Number(modalidad?.id)
  if (modalityDocumentRequirements[modalityId]) {
    return modalityDocumentRequirements[modalityId]
  }

  const name = normalizeText(modalidad?.nombre)
  if (name.includes('VICTIMAS DE TERRORISMO')) return modalityDocumentRequirements[3]
  if (name.includes('TITULADOS') || name.includes('GRADUADOS')) return modalityDocumentRequirements[4]
  if (name.includes('DISCAPACIDAD')) return modalityDocumentRequirements[5]
  if (name.includes('DEPORTISTAS')) return modalityDocumentRequirements[6]
  if (name.includes('1ER') || name.includes('2DO') || name.includes('PUESTO')) return modalityDocumentRequirements[7]

  return modalityDocumentRequirements[1]
}

function normalizeText(value) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function pickRequirementFiles(documents, requirements) {
  return Object.fromEntries(
    requirements
      .map((document) => [document.key, documents[document.key]])
      .filter(([, file]) => Boolean(file)),
  )
}

function buildPayload(inicio, form, documentRequirements) {
  return {
    ...form,
    tipoDocumento: inicio.tipoDocumento,
    numeroDocumento: inicio.numeroDocumento,
    procesoAdmisionId: Number(inicio.procesoAdmisionId),
    modalidadAdmisionId: Number(inicio.modalidadAdmisionId),
    tipoColegio: inicio.tipoColegio,
    pagoBancarioId: Number(inicio.pago.id),
    fechaNacimiento: emptyToNull(form.fechaNacimiento),
    edad: numberOrNull(form.edad),
    numeroHijos: numberOrNull(form.numeroHijos),
    periodoEstudioInicio: numberOrNull(form.periodoEstudioInicio),
    periodoEstudioFin: numberOrNull(form.periodoEstudioFin),
    areaAcademicaId: numberOrNull(form.areaAcademicaId),
    escuelaProfesionalId: numberOrNull(form.escuelaProfesionalId),
    programaAcademicoId: numberOrNull(form.programaAcademicoId),
    documentos: documentRequirements.map((document) => ({
      clave: document.key,
      tipoDocumento: document.label,
      obligatorio: document.required,
    })),
  }
}
