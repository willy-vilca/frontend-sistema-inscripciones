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

export function buildFileUrl(path) {
  if (!path) return '#'
  return `${api.defaults.baseURL}${path}`
}
