import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ArrowRight, CreditCard, FileText } from 'lucide-react'
import { PublicHeader } from '../../components/public/PublicHeader'
import { FormField } from '../../components/form/FormField'
import { PaymentValidationModal } from '../../components/registration/PaymentValidationModal'
import {
  getRegistrationCatalogs,
  verifyDocumentAvailability,
} from '../../services/registrationApi'
import { inputClass } from '../../utils/styles'

const initialForm = {
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  procesoAdmisionId: '',
  modalidadAdmisionId: '',
  tipoColegio: 'PUBLICO',
}

export function RegistrationStartPage() {
  const navigate = useNavigate()
  const [catalogs, setCatalogs] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingDocument, setCheckingDocument] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  useEffect(() => {
    let active = true

    getRegistrationCatalogs()
      .then((data) => {
        if (!active) return
        setCatalogs(data)
        setForm((current) => ({
          ...current,
          tipoDocumento: data.tiposDocumento?.[0]?.value ?? 'DNI',
          procesoAdmisionId: data.procesosAdmision?.[0]?.id?.toString() ?? '',
          modalidadAdmisionId: data.modalidadesAdmision?.[0]?.id?.toString() ?? '',
          tipoColegio: data.tiposColegio?.[0]?.value ?? 'PUBLICO',
        }))
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar el inicio',
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

  const selectedModalidad = useMemo(
    () =>
      catalogs?.modalidadesAdmision?.find(
        (modalidad) => modalidad.id.toString() === form.modalidadAdmisionId,
      ),
    [catalogs, form.modalidadAdmisionId],
  )

  const selectedProceso = useMemo(
    () =>
      catalogs?.procesosAdmision?.find(
        (proceso) => proceso.id.toString() === form.procesoAdmisionId,
      ),
    [catalogs, form.procesoAdmisionId],
  )

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'tipoDocumento' && value === 'PASAPORTE') {
        next.numeroDocumento = current.numeroDocumento.toUpperCase()
      }
      return next
    })
    if (field === 'modalidadAdmisionId') {
      setPayment(null)
    }
  }

  const updateDocumentNumber = (value) => {
    const normalizedValue = form.tipoDocumento === 'PASAPORTE' ? value.toUpperCase() : value
    updateField('numeroDocumento', normalizedValue)
  }

  const checkDocument = async ({ silent = false } = {}) => {
    if (!form.tipoDocumento || !form.numeroDocumento || !form.procesoAdmisionId) {
      if (!silent) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'Ingresa documento y proceso de admision.',
        })
      }
      return false
    }

    const documentFormatError = getDocumentFormatError(form.tipoDocumento, form.numeroDocumento)
    if (documentFormatError) {
      if (!silent) {
        Swal.fire({
          icon: 'warning',
          title: 'Formato de documento invalido',
          text: documentFormatError,
        })
      }
      return false
    }

    setCheckingDocument(true)
    try {
      const response = await verifyDocumentAvailability({
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: normalizeDocumentNumber(form.tipoDocumento, form.numeroDocumento),
        procesoAdmisionId: Number(form.procesoAdmisionId),
      })

      if (!response.disponible) {
        Swal.fire({
          icon: 'warning',
          title: 'Documento ya inscrito',
          text: response.mensaje,
        })
        return false
      }

      if (!silent) {
        Swal.fire({
          icon: 'success',
          title: 'Documento disponible',
          text: response.mensaje,
          timer: 1400,
          showConfirmButton: false,
        })
      }
      return true
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo validar',
        text:
          error.response?.data?.message ??
          'Ocurrio un problema al validar el documento.',
      })
      return false
    } finally {
      setCheckingDocument(false)
    }
  }

  const handleContinue = async (event) => {
    event.preventDefault()

    const documentFormatError = getDocumentFormatError(form.tipoDocumento, form.numeroDocumento)
    if (documentFormatError) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato de documento invalido',
        text: documentFormatError,
      })
      return
    }

    const documentAvailable = await checkDocument({ silent: true })
    if (!documentAvailable) return

    if (!payment) {
      Swal.fire({
        icon: 'warning',
        title: 'Valida tu pago',
        text: 'Debes agregar un pago valido antes de ir a la ficha.',
      })
      return
    }

    sessionStorage.setItem(
      'inicioInscripcion',
      JSON.stringify({
        ...form,
        numeroDocumento: normalizeDocumentNumber(form.tipoDocumento, form.numeroDocumento),
        procesoAdmision: selectedProceso,
        modalidadAdmision: selectedModalidad,
        pago: payment,
      }),
    )

    navigate('/inscripcion/ficha')
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <PublicHeader />

      <section className="mx-auto w-full max-w-4xl px-5 py-10">
        <form onSubmit={handleContinue} className="rounded-md border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-6 py-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              Registro de postulante
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Inicio de inscripcion
            </h2>
          </header>

          <div className="space-y-5 px-6 py-6">
            {loading ? (
              <div className="rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Cargando datos...
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
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

                  <FormField label="Documento" required>
                    <div className="flex gap-2">
                      <input
                        value={form.numeroDocumento}
                        onChange={(event) => updateDocumentNumber(event.target.value)}
                        onBlur={() => {
                          if (form.numeroDocumento.trim()) checkDocument({ silent: true })
                        }}
                        className={inputClass()}
                        placeholder="Ingresa tu documento"
                      />
                      <button
                        type="button"
                        onClick={() => checkDocument()}
                        disabled={checkingDocument}
                        className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        <FileText size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </FormField>
                </div>

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

                <FormField label="Modalidad de admision" required>
                  <select
                    value={form.modalidadAdmisionId}
                    onChange={(event) => updateField('modalidadAdmisionId', event.target.value)}
                    className={inputClass()}
                  >
                    {catalogs?.modalidadesAdmision?.map((modalidad) => (
                      <option key={modalidad.id} value={modalidad.id}>
                        {modalidad.nombre}
                      </option>
                    ))}
                  </select>
                </FormField>

                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-slate-700">
                    Tipo de colegio
                  </legend>
                  <div className="flex flex-wrap gap-4">
                    {catalogs?.tiposColegio?.map((tipo) => (
                      <label key={tipo.value} className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="tipoColegio"
                          value={tipo.value}
                          checked={form.tipoColegio === tipo.value}
                          onChange={(event) => updateField('tipoColegio', event.target.value)}
                          className="h-4 w-4 accent-red-700"
                        />
                        {tipo.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Adjuntar pago
                  </span>
                  <div className="flex overflow-hidden rounded-md border border-slate-300 bg-slate-50">
                    <div className="flex min-h-12 flex-1 items-center px-4 text-sm font-semibold text-slate-600">
                      {payment ? formatPaymentLabel(payment) : 'S/ 0.00'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(true)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      <CreditCard size={18} aria-hidden="true" />
                      Validar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <footer className="flex justify-center border-t border-slate-200 px-6 py-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Ir a la ficha
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </footer>
        </form>
      </section>

      {paymentModalOpen ? (
        <PaymentValidationModal
          key={`${form.modalidadAdmisionId}-${payment?.id ?? 'nuevo'}`}
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          modalidad={selectedModalidad}
          selectedPayment={payment}
          onSave={setPayment}
        />
      ) : null}
    </main>
  )
}

function formatPaymentLabel(payment) {
  const monto = Number(payment.monto ?? 0).toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN',
  })
  return `${monto} - Mov. ${payment.nroMovimiento}`
}

function normalizeDocumentNumber(tipoDocumento, numeroDocumento) {
  const value = numeroDocumento.trim()
  return tipoDocumento === 'PASAPORTE' ? value.toUpperCase() : value
}

function getDocumentFormatError(tipoDocumento, numeroDocumento) {
  const value = normalizeDocumentNumber(tipoDocumento, numeroDocumento)

  if (tipoDocumento === 'DNI' && !/^\d{8}$/.test(value)) {
    return 'El DNI debe tener exactamente 8 digitos.'
  }

  if (tipoDocumento === 'CARNET_EXTRANJERIA' && !/^\d{12}$/.test(value)) {
    return 'El carnet de extranjeria debe tener exactamente 12 digitos.'
  }

  if (tipoDocumento === 'PASAPORTE' && !/^[A-Z]{3}\d{6}$/.test(value)) {
    return 'El pasaporte debe tener 3 letras seguidas de 6 digitos. Ejemplo: ABC123456.'
  }

  return null
}
