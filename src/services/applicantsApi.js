import { api } from './api'

export async function getApplicantsSummary() {
  const response = await api.get('/admin/postulantes/resumen')
  return response.data
}

export async function getApplicants(search = '') {
  const response = await api.get('/admin/postulantes', {
    params: search ? { buscar: search } : {},
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
