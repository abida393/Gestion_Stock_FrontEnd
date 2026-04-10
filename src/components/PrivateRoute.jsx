import { Navigate, Outlet } from 'react-router-dom';

/**
 * PrivateRoute — wraps protected routes.
 * If no token exists in localStorage, redirects to the login page.
 * If a token exists, renders the child routes via <Outlet />.
 */
export default function PrivateRoute() {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/" replace />;
}
