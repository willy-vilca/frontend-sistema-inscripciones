import { api } from './api'

export async function getPaymentsSummary() {
  const response = await api.get('/admin/pagos/resumen')
  return response.data
}

export async function getLatestPayments() {
  const response = await api.get('/admin/pagos')
  return response.data
}

export async function importPaymentsFile(file) {
  const formData = new FormData()
  formData.append('archivo', file)

  const response = await api.post('/admin/pagos/importar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
