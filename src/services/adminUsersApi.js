import { api } from './api'

export async function getAdminUsers() {
  const response = await api.get('/admin/usuarios')
  return response.data
}

export async function createAdminUser(payload) {
  const response = await api.post('/admin/usuarios', payload)
  return response.data
}

export async function updateAdminUser(id, payload) {
  const response = await api.put(`/admin/usuarios/${id}`, payload)
  return response.data
}

export async function updateAdminUserStatus(id, activo) {
  const response = await api.patch(`/admin/usuarios/${id}/estado`, { activo })
  return response.data
}
