import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { PaymentSummaryCards } from '../../components/admin/PaymentSummaryCards'
import { PaymentUploadPanel } from '../../components/admin/PaymentUploadPanel'
import { PaymentsTable } from '../../components/admin/PaymentsTable'
import {
  getLatestPayments,
  getPaymentsSummary,
  importPaymentsFile,
} from '../../services/paymentsApi'

export function AdminPaymentsPage() {
  const [summary, setSummary] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const refreshPayments = async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true)
    }
    try {
      const [summaryData, paymentsData] = await Promise.all([
        getPaymentsSummary(),
        getLatestPayments(),
      ])
      setSummary(summaryData)
      setPayments(paymentsData)
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar pagos',
        text: 'Verifica que el backend este iniciado correctamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    Promise.all([getPaymentsSummary(), getLatestPayments()])
      .then(([summaryData, paymentsData]) => {
        if (!active) return
        setSummary(summaryData)
        setPayments(paymentsData)
      })
      .catch(() => {
        if (!active) return
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar pagos',
          text: 'Verifica que el backend este iniciado correctamente.',
        })
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const result = await importPaymentsFile(file)
      await Swal.fire({
        icon: 'success',
        title: 'Pagos importados',
        html: `
          <div style="text-align:left">
            <p><b>Archivo:</b> ${result.archivo}</p>
            <p><b>Filas leidas:</b> ${result.filasLeidas}</p>
            <p><b>Importados:</b> ${result.pagosImportados}</p>
            <p><b>Duplicados:</b> ${result.pagosDuplicados}</p>
            <p><b>Omitidos:</b> ${result.filasOmitidas}</p>
          </div>
        `,
      })
      refreshPayments()
    } catch (error) {
      const message =
        error.response?.data?.message ??
        'No se pudo importar el archivo. Revisa que sea un Excel valido.'

      Swal.fire({
        icon: 'error',
        title: 'Error al importar',
        text: message,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <AdminLayout
      title="Pagos bancarios"
      description="Carga el archivo del banco y administra los numeros de movimiento que usaran los postulantes para validar su inscripcion."
    >
      <div className="space-y-6">
        <PaymentSummaryCards summary={summary} />
        <PaymentUploadPanel onUpload={handleUpload} uploading={uploading} />
        <PaymentsTable payments={payments} loading={loading} />
      </div>
    </AdminLayout>
  )
}
