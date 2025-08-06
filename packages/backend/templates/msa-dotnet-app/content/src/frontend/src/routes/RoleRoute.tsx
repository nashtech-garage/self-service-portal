// src/routes/RoleRoute.tsx
import Forbidden from "@pages/Errors/Forbidden";
import type { RootState } from "@store";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

interface RoleRouteProps {
  allowedTypes: number[]; // e.g., [USER_TYPE_ENUM.ADMIN]
}

const RoleRoute = ({ allowedTypes }: RoleRouteProps) => {
  const userType = useSelector((state: RootState) => state.auth.userProfile)?.userType;

  if (!userType || !allowedTypes.includes(userType)) {
    return <Forbidden />;
  }

  return <Outlet />;
};

export default RoleRoute;
