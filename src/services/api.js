import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://sistema-inscripcionesbackend-f2bxckepayb0h8h2.brazilsouth-01.azurewebsites.net/api',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getApiStatus() {
  const response = await api.get('/status')
  return response.data
}
