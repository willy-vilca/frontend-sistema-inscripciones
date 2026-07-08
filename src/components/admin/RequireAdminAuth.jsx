import { Navigate, useLocation } from 'react-router-dom'
import { hasAdminSession } from '../../services/adminAuthApi'

export function RequireAdminAuth({ children }) {
  const location = useLocation()

  if (!hasAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}
