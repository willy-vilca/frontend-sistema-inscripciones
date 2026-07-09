import { Navigate, useLocation } from 'react-router-dom'
import { getStoredAdminSession, hasAdminSession } from '../../services/adminAuthApi'

export function RequireAdminAuth({ children, requiredRole }) {
  const location = useLocation()

  if (!hasAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  const session = getStoredAdminSession()
  if (requiredRole && session?.user?.rol !== requiredRole) {
    return <Navigate to="/admin" replace />
  }

  return children
}
