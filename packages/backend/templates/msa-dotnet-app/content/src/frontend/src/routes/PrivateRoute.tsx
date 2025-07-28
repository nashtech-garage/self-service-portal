import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@store/index";
import { ROUTES } from "@constants/routes";

type Props = {
  children: JSX.Element;
};

const PrivateRoute = ({ children }: Props) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN.path} replace />;
  }

  return children;
};

export default PrivateRoute;
