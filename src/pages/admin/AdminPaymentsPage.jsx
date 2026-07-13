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

const DEFAULT_FILTERS = {
  busqueda: '',
  estado: 'TODOS',
}

const ROWS_PER_PAGE = 5
const BLOCK_SIZE = 100

export function AdminPaymentsPage() {
  const [summary, setSummary] = useState(null)
  const [payments, setPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [block, setBlock] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const refreshPayments = async ({
    showLoading = false,
    nextFilters = filters,
    nextBlock = 0,
    nextPage = 0,
  } = {}) => {
    if (showLoading) {
      setLoading(true)
    }
    try {
      const [summaryData, paymentsData] = await Promise.all([
        getPaymentsSummary(),
        getLatestPayments({ ...nextFilters, bloque: nextBlock }),
      ])
      setSummary(summaryData)
      setPayments(paymentsData)
      setFilters(nextFilters)
      setBlock(nextBlock)
      setPage(nextPage)
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

    Promise.all([getPaymentsSummary(), getLatestPayments(DEFAULT_FILTERS)])
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
            <p><b>Actualizados:</b> ${result.pagosActualizados ?? 0}</p>
            <p><b>Duplicados:</b> ${result.pagosDuplicados}</p>
            <p><b>Omitidos:</b> ${result.filasOmitidas}</p>
          </div>
        `,
      })
      refreshPayments()
    } catch (error) {
      const message = error.code === 'ECONNABORTED'
        ? 'La importacion tardo demasiado. Recarga la tabla para verificar si el backend termino el proceso.'
        : error.response?.data?.message ??
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

  const totalPages = Math.max(1, Math.ceil(payments.length / ROWS_PER_PAGE))
  const visiblePayments = payments.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
  const hasNextBlock = payments.length === BLOCK_SIZE
  const canGoPrevious = page > 0 || block > 0
  const canGoNext = page < totalPages - 1 || hasNextBlock

  const handleSearch = (event) => {
    event.preventDefault()
    const nextFilters = {
      ...filters,
      busqueda: searchTerm.trim(),
    }
    refreshPayments({ showLoading: true, nextFilters, nextBlock: 0, nextPage: 0 })
  }

  const handleStatusChange = (event) => {
    const nextFilters = {
      busqueda: searchTerm.trim(),
      estado: event.target.value,
    }
    refreshPayments({ showLoading: true, nextFilters, nextBlock: 0, nextPage: 0 })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    refreshPayments({
      showLoading: true,
      nextFilters: DEFAULT_FILTERS,
      nextBlock: 0,
      nextPage: 0,
    })
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage((currentPage) => currentPage + 1)
      return
    }

    if (hasNextBlock) {
      refreshPayments({
        showLoading: true,
        nextFilters: filters,
        nextBlock: block + 1,
        nextPage: 0,
      })
    }
  }

  const handlePreviousPage = async () => {
    if (page > 0) {
      setPage((currentPage) => currentPage - 1)
      return
    }

    if (block <= 0) {
      return
    }

    setLoading(true)
    try {
      const previousBlock = block - 1
      const [summaryData, paymentsData] = await Promise.all([
        getPaymentsSummary(),
        getLatestPayments({ ...filters, bloque: previousBlock }),
      ])
      setSummary(summaryData)
      setPayments(paymentsData)
      setBlock(previousBlock)
      setPage(Math.max(0, Math.ceil(paymentsData.length / ROWS_PER_PAGE) - 1))
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

  return (
    <AdminLayout
      title="Pagos bancarios"
      description="Carga el archivo del banco y administra los numeros de movimiento que usaran los postulantes para validar su inscripcion."
    >
      <div className="space-y-6">
        <PaymentSummaryCards summary={summary} />
        <PaymentUploadPanel onUpload={handleUpload} uploading={uploading} />
        <PaymentsTable
          payments={visiblePayments}
          loading={loading}
          searchTerm={searchTerm}
          statusFilter={filters.estado}
          totalLoaded={payments.length}
          block={block}
          page={page}
          totalPages={totalPages}
          rowsPerPage={ROWS_PER_PAGE}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onSearchTermChange={setSearchTerm}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
    </AdminLayout>
  )
}
