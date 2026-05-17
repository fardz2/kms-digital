import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';
import { ROLE_HOME } from '../features/auth/roleHome';
import type { Role } from '../types';

interface RequireRoleProps {
  allow: Role[];
  children?: React.ReactNode;
}

export default function RequireRole({ allow, children }: RequireRoleProps) {
  const { isAuthenticated, role } = useSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  if (allow && allow.length > 0 && role && !allow.includes(role)) {
    const home = ROLE_HOME[role] ?? '/';
    return <Navigate to={home} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
