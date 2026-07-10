import { api } from './api'

export async function getRegistrationCatalogs() {
  const response = await api.get('/public/inscripcion/catalogos')
  return response.data
}

export async function getApplicationConsultCatalogs() {
  const response = await api.get('/public/inscripcion/catalogos-consulta')
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

export async function consultApplication(payload) {
  const response = await api.post('/public/inscripcion/consultar', payload)
  return response.data
}

export async function getAcademicAreas() {
  const response = await api.get('/public/catalogos/areas')
  return response.data
}

export async function getProfessionalSchools(areaId) {
  const response = await api.get('/public/catalogos/escuelas', {
    params: { areaId },
  })
  return response.data
}

export async function getAcademicPrograms(escuelaId) {
  const response = await api.get('/public/catalogos/programas', {
    params: { escuelaId },
  })
  return response.data
}

export async function registerApplication(payload, photo, documents) {
  const formData = new FormData()
  formData.append('datos', JSON.stringify(payload))
  formData.append('foto', photo)

  Object.entries(documents).forEach(([key, file]) => {
    if (file) {
      formData.append('documentos', file)
      formData.append('documentoKeys', key)
    }
  })

  const response = await api.post('/public/inscripcion/registrar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 180000,
  })

  return response.data
}

export async function downloadApplicantCard(downloadUrl, filename) {
  const response = await api.get(downloadUrl, {
    responseType: 'blob',
    timeout: 180000,
  })

  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
