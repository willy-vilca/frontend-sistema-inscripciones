import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import Swal from 'sweetalert2'
import { AlertTriangle, ArrowLeft, Download, IdCard } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  buildFileUrl,
  downloadAdminFile,
  getAdminFileBlob,
  getApplicantDetail,
} from '../../services/applicantsApi'

function valueOrDash(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  return value
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return format(new Date(value), value.includes('T') ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')
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

function formatBytes(value) {
  if (!value) return '-'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function statusLabel(value) {
  return value ? value.replaceAll('_', ' ') : '-'
}

function statusBadgeClass(status) {
  const styles = {
    REGISTRADA: 'bg-amber-100 text-amber-700 ring-amber-200',
    APROBADA: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    ANULADA: 'bg-red-100 text-red-700 ring-red-200',
    BORRADOR: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return styles[status] ?? styles.BORRADOR
}

export function AdminApplicantDetailPage() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoObjectUrl, setPhotoObjectUrl] = useState({ source: null, url: null })

  useEffect(() => {
    let active = true

    getApplicantDetail(id)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch(() => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar el postulante',
          text: 'Verifica que el backend este iniciado correctamente.',
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    let active = true
    let objectUrl = null

    if (!detail?.fotoUrl) {
      return () => {
        active = false
      }
    }

    getAdminFileBlob(detail.fotoUrl)
      .then((blob) => {
        objectUrl = window.URL.createObjectURL(blob)
        if (active) {
          setPhotoObjectUrl({ source: detail.fotoUrl, url: objectUrl })
        } else {
          window.URL.revokeObjectURL(objectUrl)
        }
      })
      .catch(() => {
        if (!active) return
        setPhotoObjectUrl({ source: detail.fotoUrl, url: null })
      })

    return () => {
      active = false
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl)
      }
    }
  }, [detail?.fotoUrl])

  async function handleDocumentDownload(document) {
    try {
      await downloadAdminFile(document.downloadUrl, document.nombreOriginal)
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo descargar el documento',
        text: 'Verifica que tu sesion siga activa y vuelve a intentarlo.',
      })
    }
  }

  const currentPhotoUrl =
    photoObjectUrl.source === detail?.fotoUrl ? photoObjectUrl.url : null

  return (
    <AdminLayout
      title="Informacion del postulante"
      description="Detalle completo de la ficha registrada, pago bancario vinculado, documentos anexos y carne digital."
    >
      <div className="space-y-6">
        <Link
          to="/admin/postulantes"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Volver a postulantes
        </Link>

        {loading ? (
          <section className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando informacion...
          </section>
        ) : !detail ? (
          <section className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No se encontro la inscripcion solicitada.
          </section>
        ) : (
          <>
            <HeaderPanel detail={detail} photoObjectUrl={currentPhotoUrl} />

            {detail.estado === 'ANULADA' && (
              <section className="rounded-md border border-red-200 bg-red-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700">
                    <AlertTriangle size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">Motivo de anulacion</h3>
                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {valueOrDash(detail.observaciones)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <InfoSection title="Datos personales">
              <InfoGrid
                items={[
                  ['Nombres', detail.datosPersonales.nombres],
                  ['Apellido paterno', detail.datosPersonales.apellidoPaterno],
                  ['Apellido materno', detail.datosPersonales.apellidoMaterno],
                  ['Documento', `${detail.datosPersonales.tipoDocumento} ${detail.datosPersonales.numeroDocumento}`],
                  ['Sexo', detail.datosPersonales.sexo],
                  ['Fecha de nacimiento', formatDate(detail.datosPersonales.fechaNacimiento)],
                  ['Edad', detail.datosPersonales.edad],
                  ['Estado civil', detail.datosPersonales.estadoCivil],
                  ['Nro de hijos', detail.datosPersonales.numeroHijos],
                  ['Procedencia', detail.datosPersonales.procedencia],
                ]}
              />
            </InfoSection>

            <InfoSection title="Lugar de nacimiento y domicilio">
              <InfoGrid
                items={[
                  ['Pais nacimiento', detail.lugarNacimiento.pais],
                  ['Departamento nacimiento', detail.lugarNacimiento.departamento],
                  ['Provincia nacimiento', detail.lugarNacimiento.provincia],
                  ['Distrito nacimiento', detail.lugarNacimiento.distrito],
                  ['Departamento domicilio', detail.direccionDomiciliaria.departamento],
                  ['Provincia domicilio', detail.direccionDomiciliaria.provincia],
                  ['Distrito domicilio', detail.direccionDomiciliaria.distrito],
                  ['Direccion', detail.direccionDomiciliaria.direccion],
                ]}
              />
            </InfoSection>

            <InfoSection title="Contacto, ocupacion y apoderado">
              <InfoGrid
                items={[
                  ['Correo electronico', detail.contacto.correoElectronico],
                  ['Telefono 1', detail.contacto.telefono1],
                  ['Telefono 2', detail.contacto.telefono2],
                  ['Trabaja', detail.ocupacion.trabaja],
                  ['Ocupacion', detail.ocupacion.ocupacion],
                  ['Condicion laboral', detail.ocupacion.condicionLaboral],
                  ['Institucion o empresa', detail.ocupacion.institucionEmpresa],
                  ['Tipo apoderado', detail.apoderado.tipoApoderado],
                  ['Nombre apoderado', detail.apoderado.nombreCompleto],
                  ['Relacion', detail.apoderado.relacion],
                  ['Telefono apoderado', detail.apoderado.telefono],
                  ['Correo apoderado', detail.apoderado.correoElectronico],
                ]}
              />
            </InfoSection>

            <InfoSection title="Educacion e informacion adicional">
              <InfoGrid
                items={[
                  ['Tipo educacion', detail.educacionSecundaria.tipoEducacion],
                  ['Estudios concluidos', detail.educacionSecundaria.estudiosConcluidos],
                  ['Departamento colegio', detail.educacionSecundaria.departamento],
                  ['Provincia colegio', detail.educacionSecundaria.provincia],
                  ['Institucion educativa', detail.educacionSecundaria.institucionEducativa],
                  ['Periodo de estudio', periodo(detail.educacionSecundaria.periodoInicio, detail.educacionSecundaria.periodoFin)],
                  ['Presenta discapacidad', detail.informacionAdicional.presentaDiscapacidad],
                  ['Detalle discapacidad', detail.informacionAdicional.discapacidadDetalle],
                  ['Preparacion universitaria', detail.informacionAdicional.preparacionUniversitaria],
                ]}
              />
            </InfoSection>

            <InfoSection title="Datos de postulacion">
              <InfoGrid
                items={[
                  ['Proceso', detail.datosPostulacion.procesoAdmision],
                  ['Modalidad', detail.datosPostulacion.modalidadAdmision],
                  ['Tipo colegio', detail.datosPostulacion.tipoColegio],
                  ['Area academica', detail.datosPostulacion.areaAcademica],
                  ['Escuela profesional', detail.datosPostulacion.escuelaProfesional],
                  ['Programa academico', detail.datosPostulacion.programaAcademico],
                  ['Medio de difusion', detail.datosPostulacion.medioDifusion],
                  ['Otro medio', detail.datosPostulacion.medioDifusionOtro],
                  ['Acepto terminos', detail.datosPostulacion.aceptaTerminos],
                ]}
              />
            </InfoSection>

            <PaymentPanel payment={detail.pago} />
            <DocumentsPanel documents={detail.documentos} onDownload={handleDocumentDownload} />
          </>
        )}
      </div>
    </AdminLayout>
  )
}

function HeaderPanel({ detail, photoObjectUrl }) {
  const fullName = [
    detail.datosPersonales.nombres,
    detail.datosPersonales.apellidoPaterno,
    detail.datosPersonales.apellidoMaterno,
  ].filter(Boolean).join(' ')

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 md:grid-cols-[150px_1fr_auto] md:items-center">
        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          {photoObjectUrl ? (
            <img
              src={photoObjectUrl}
              alt="Foto del postulante"
              className="h-full w-full object-cover"
            />
          ) : (
            <IdCard size={44} className="text-slate-400" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
            Codigo {detail.codigoPostulante}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-slate-950">{fullName}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {detail.datosPersonales.tipoDocumento} {detail.datosPersonales.numeroDocumento}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusBadgeClass(detail.estado)}`}>
              {statusLabel(detail.estado)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {formatDate(detail.fechaRegistro)}
            </span>
          </div>
        </div>
        <a
          href={buildFileUrl(detail.carneDownloadUrl)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          <IdCard size={18} aria-hidden="true" />
          Descargar carne
        </a>
      </div>
    </section>
  )
}

function InfoSection({ title, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function InfoGrid({ items }) {
  return (
    <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="border-b border-slate-100 pb-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{valueOrDash(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

function PaymentPanel({ payment }) {
  return (
    <InfoSection title="Pago bancario vinculado">
      <InfoGrid
        items={[
          ['Nro movimiento', payment.nroMovimiento],
          ['Cliente banco', payment.nombreCliente],
          ['Codigo', payment.codigo],
          ['Descripcion', payment.descripcionPago],
          ['Importe a pagar', formatMoney(payment.importeAPagar)],
          ['Importe pagado', formatMoney(payment.importePagado)],
          ['Oficina', payment.oficina],
          ['Fecha pago', formatDate(payment.fechaPago)],
          ['Fecha proceso', formatDate(payment.fechaProceso)],
          ['Forma pago', payment.formaPago],
          ['Canal', payment.canal],
          ['Archivo origen', payment.archivoOrigen],
        ]}
      />
    </InfoSection>
  )
}

function DocumentsPanel({ documents, onDownload }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-950">Documentos anexos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Documento</th>
              <th className="px-5 py-3 font-bold">Archivo</th>
              <th className="px-5 py-3 font-bold">Tamano</th>
              <th className="px-5 py-3 font-bold">Estado</th>
              <th className="px-5 py-3 font-bold">Descarga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan="5">
                  No hay documentos cargados.
                </td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id} className="hover:bg-slate-50">
                  <td className="max-w-[360px] px-5 py-4 text-slate-700">
                    <span className="line-clamp-2">{document.tipoDocumento}</span>
                    {document.obligatorio ? (
                      <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        Obligatorio
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{document.nombreOriginal}</td>
                  <td className="px-5 py-4 text-slate-600">{formatBytes(document.tamanioBytes)}</td>
                  <td className="px-5 py-4 text-slate-600">{document.estado}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onDownload(document)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-700 hover:text-red-700"
                      title="Descargar documento"
                    >
                      <Download size={17} aria-hidden="true" />
                    </button>
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

function periodo(inicio, fin) {
  if (!inicio && !fin) return null
  return `${valueOrDash(inicio)} - ${valueOrDash(fin)}`
}
