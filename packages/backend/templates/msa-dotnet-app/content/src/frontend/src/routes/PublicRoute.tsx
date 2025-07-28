import { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import { ROUTES } from '@/constants/routes';

type Props = {
  children: JSX.Element;
};

const PublicRoute = ({ children }: Props) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // If the user is authenticated, redirect to the dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME.path} replace />;
  }

  return children;
};

export default PublicRoute;