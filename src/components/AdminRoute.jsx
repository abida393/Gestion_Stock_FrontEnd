import { Navigate, Outlet } from 'react-router-dom';
import { isAdmin } from '../services/permissionHelper';

/**
 * Route guard for admin-only pages.
 * Redirects to /dashboard with an access denied message if user is not admin.
 */
export default function AdminRoute() {
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
  }
  return <Outlet />;
}
