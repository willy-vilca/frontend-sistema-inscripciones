import { api } from './api'

export async function getRegistrationCatalogs() {
  const response = await api.get('/public/inscripcion/catalogos')
  return response.data
}

export async function verifyDocumentAvailability(payload) {
  const response = await api.post('/public/inscripcion/verificar-documento', payload)
  return response.data
}

export async function validateRegistrationPayment(payload) {
  const response = await api.post('/public/inscripcion/validar-pago', payload)
  return response.data
}
