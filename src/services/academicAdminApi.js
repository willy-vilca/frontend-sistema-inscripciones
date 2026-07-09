import { api } from './api'

export async function getAcademicProcesses() {
  const response = await api.get('/admin/academico/procesos')
  return response.data
}

export async function createAcademicProcess(payload) {
  const response = await api.post('/admin/academico/procesos', payload)
  return response.data
}

export async function updateAcademicProcess(id, payload) {
  const response = await api.put(`/admin/academico/procesos/${id}`, payload)
  return response.data
}

export async function getAcademicAreasAdmin() {
  const response = await api.get('/admin/academico/areas')
  return response.data
}

export async function createAcademicArea(payload) {
  const response = await api.post('/admin/academico/areas', payload)
  return response.data
}

export async function updateAcademicArea(id, payload) {
  const response = await api.put(`/admin/academico/areas/${id}`, payload)
  return response.data
}

export async function getProfessionalCareersAdmin() {
  const response = await api.get('/admin/academico/carreras')
  return response.data
}

export async function createProfessionalCareer(payload) {
  const response = await api.post('/admin/academico/carreras', payload)
  return response.data
}

export async function updateProfessionalCareer(id, payload) {
  const response = await api.put(`/admin/academico/carreras/${id}`, payload)
  return response.data
}

export async function getAcademicStats(filters = {}) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
  const response = await api.get('/admin/academico/estadisticas', {
    params: cleanFilters,
  })
  return response.data
}
