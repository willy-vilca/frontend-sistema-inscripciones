import { api } from './api'

export async function getPaymentsSummary() {
  const response = await api.get('/admin/pagos/resumen')
  return response.data
}

export async function getLatestPayments({ busqueda = '', estado = 'TODOS', bloque = 0 } = {}) {
  const response = await api.get('/admin/pagos', {
    params: {
      busqueda: busqueda || undefined,
      estado,
      bloque,
    },
  })
  return response.data
}

export async function importPaymentsFile(file) {
  const formData = new FormData()
  formData.append('archivo', file)

  const response = await api.post('/admin/pagos/importar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 180000,
  })

  return response.data
}
