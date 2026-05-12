import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';
import { ROLE_HOME } from '../features/auth/roleHome';

export default function RequireRole({ allow, children }) {
  const { isAuthenticated, role } = useSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  if (allow && allow.length > 0 && !allow.includes(role)) {
    const home = ROLE_HOME[role] ?? '/';
    return <Navigate to={home} replace />;
  }

  return children ?? <Outlet />;
}
