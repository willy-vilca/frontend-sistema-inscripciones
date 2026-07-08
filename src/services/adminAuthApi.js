import { api } from './api'

const SESSION_KEY = 'adminSession'
const TOKEN_KEY = 'adminToken'

export async function loginAdmin(payload) {
  const response = await api.post('/admin/auth/login', payload)
  return response.data
}

export async function getCurrentAdmin() {
  const response = await api.get('/admin/auth/me')
  return response.data
}

export function saveAdminSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getStoredAdminSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    clearAdminSession()
    return null
  }
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(SESSION_KEY)
}

export function hasAdminSession() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}
