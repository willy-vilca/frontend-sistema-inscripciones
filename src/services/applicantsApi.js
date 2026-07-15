import { api } from './api'

export async function getApplicantsSummary() {
  const response = await api.get('/admin/postulantes/resumen')
  return response.data
}

export async function getApplicants(options = '') {
  const params = typeof options === 'string'
    ? { buscar: options || undefined }
    : {
        buscar: options.buscar || undefined,
        estado: options.estado || 'TODOS',
        bloque: options.bloque ?? 0,
      }

  const response = await api.get('/admin/postulantes', {
    params,
  })
  return response.data
}

export async function getApplicantDetail(id) {
  const response = await api.get(`/admin/postulantes/${id}`)
  return response.data
}

export async function approveApplicant(id) {
  const response = await api.patch(`/admin/postulantes/${id}/aprobar`)
  return response.data
}

export async function annulApplicant(id, motivo) {
  const response = await api.patch(`/admin/postulantes/${id}/anular`, { motivo })
  return response.data
}

export async function uploadApplicantFingerprint(id, file) {
  const formData = new FormData()
  formData.append('archivo', file)

  const response = await api.post(`/admin/postulantes/${id}/huella`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 180000,
  })

  return response.data
}

export async function getAdminFileBlob(path) {
  const response = await api.get(path, {
    responseType: 'blob',
    timeout: 180000,
  })

  return response.data
}

export async function downloadAdminFile(path, filename) {
  const blob = await getAdminFileBlob(path)
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = blobUrl
  link.setAttribute('download', filename || 'documento')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}

export function buildFileUrl(path) {
  if (!path) return '#'
  return `${api.defaults.baseURL}${path}`
}
