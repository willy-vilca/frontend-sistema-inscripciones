import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { Plus, Trash2, X } from 'lucide-react'
import { FormField } from '../form/FormField'
import { inputClass } from '../../utils/styles'
import { validateRegistrationPayment } from '../../services/registrationApi'

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return 'S/ 0.00'
  return Number(value).toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN',
  })
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export function PaymentValidationModal({
  open,
  onClose,
  modalidad,
  selectedPayment,
  onSave,
}) {
  const [form, setForm] = useState({
    pagoPor: 'ENTIDAD_FINANCIERA',
    nroMovimiento: '',
    monto: modalidad?.montoBase ?? 400,
    fechaPago: '',
  })
  const [payment, setPayment] = useState(selectedPayment)
  const [validating, setValidating] = useState(false)

  const montoBase = useMemo(() => modalidad?.montoBase ?? 400, [modalidad])

  if (!open) return null

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleAddPayment = async () => {
    if (!form.nroMovimiento || !form.monto) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Ingresa el numero de movimiento y el monto del pago.',
      })
      return
    }

    setValidating(true)
    try {
      const result = await validateRegistrationPayment({
        nroMovimiento: form.nroMovimiento,
        monto: Number(form.monto),
        fechaPago: form.fechaPago || null,
      })
      setPayment(result)
      updateField('fechaPago', formatDate(result.fechaPago) || form.fechaPago)
      Swal.fire({
        icon: 'success',
        title: 'Pago validado',
        text: result.mensaje,
        timer: 1400,
        showConfirmButton: false,
      })
    } catch (error) {
      const message =
        error.response?.data?.message ??
        'No se pudo validar el pago con los datos ingresados.'
      Swal.fire({
        icon: 'error',
        title: 'Pago no valido',
        text: message,
      })
    } finally {
      setValidating(false)
    }
  }

  const handleSave = () => {
    if (!payment) {
      Swal.fire({
        icon: 'warning',
        title: 'Agrega un pago',
        text: 'Debes validar y agregar un pago antes de guardar.',
      })
      return
    }

    onSave(payment)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Datos del pago - monto base: {Number(montoBase).toFixed(2)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar"
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>

        <div className="max-h-[calc(92vh-84px)] overflow-y-auto px-6 py-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <FormField label="Pago por">
              <select
                value={form.pagoPor}
                onChange={(event) => updateField('pagoPor', event.target.value)}
                className={inputClass()}
              >
                <option value="ENTIDAD_FINANCIERA">Entidad Financiera (Banco/Caja)</option>
              </select>
            </FormField>

            <FormField label="Nro. Operacion" required>
              <input
                value={form.nroMovimiento}
                onChange={(event) => updateField('nroMovimiento', event.target.value)}
                className={inputClass()}
                placeholder="Ej. 626242"
              />
            </FormField>

            <button
              type="button"
              onClick={handleAddPayment}
              disabled={validating}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus size={18} aria-hidden="true" />
              {validating ? 'Validando' : 'Agregar'}
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Monto" required>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.monto}
                onChange={(event) => updateField('monto', event.target.value)}
                className={inputClass()}
              />
            </FormField>

            <FormField label="Fecha">
              <input
                type="date"
                value={form.fechaPago}
                onChange={(event) => updateField('fechaPago', event.target.value)}
                className={inputClass()}
              />
            </FormField>
          </div>

          <p className="mt-6 text-sm font-semibold text-slate-700">
            Mostrando {payment ? '1 - 1 de 1' : '0 - 0 de 0'} registros
          </p>

          <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Tipo</th>
                  <th className="px-4 py-3 font-bold">Nro. Operacion</th>
                  <th className="px-4 py-3 font-bold">Monto</th>
                  <th className="px-4 py-3 font-bold">Fecha</th>
                  <th className="px-4 py-3 font-bold">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {payment ? (
                  <tr>
                    <td className="px-4 py-4 text-slate-700">{payment.tipo}</td>
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {payment.nroMovimiento}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{formatMoney(payment.monto)}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(payment.fechaPago) || form.fechaPago || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setPayment(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700"
                        aria-label="Quitar pago"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan="5">
                      Agrega un numero de movimiento para validar el pago.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Guardar
          </button>
        </footer>
      </section>
    </div>
  )
}
