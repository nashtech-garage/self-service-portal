import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/constants/routes";
import AuthLayout from "@components/layouts/AuthLayout";
import MainLayout from "@components/layouts/MainLayout";
import { USER_TYPE_ENUM } from "@constants/user";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

const UserManagement = lazy(() => import("@/pages/Users/Management"));
const Login = lazy(() => import("@/pages/Login"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const HomePage = lazy(() => import("@/pages/Home"));
const AdminAssignmentsPage = lazy(() => import("@/pages/AssignmentsManagement"));
const ErrorTest = lazy(() => import("@/pages/ErrorTest"));
const CreateUser = lazy(() => import("@/pages/Users/Create"));
const EditUser = lazy(() => import("@/pages/Users/Edit"));
const AssetManagementList = lazy(() => import("@pages/AssetManagement/index"));
const CreateAssignment = lazy(() => import("@/pages/AssignmentsManagement/Create"));
const EditAssignment = lazy(() => import("@/pages/AssignmentsManagement/Edit"));
const Template = lazy(() => import("@/pages/Template/Template"));
const CreateAssetPage = lazy(() => import("@pages/AssetManagement/Create"));
const EditAssetPage = lazy(() => import("@pages/AssetManagement/Edit"));
const ReturningRequestManagement = lazy(() => import("@/pages/ReturningRequest"));
const ReportPage = lazy(() => import("@pages/Report"));

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      {/* AuthLayout routes */}
      <Route element={<AuthLayout />}>
        <Route
          path={ROUTES.LOGIN.path}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
      </Route>

      {/* MainLayout routes */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path={ROUTES.HOME.path} element={<HomePage />} />
        <Route path={ROUTES.PROFILE.path} element={<UserProfile />} />
        <Route path={ROUTES.ERROR_TEST.path} element={<ErrorTest />} />

        <Route element={<RoleRoute allowedTypes={[USER_TYPE_ENUM.ADMIN]} />}>
          <Route path={ROUTES.ASSIGNMENTS.path} element={<AdminAssignmentsPage />} />
          <Route path={ROUTES.ASSETS.path} element={<AssetManagementList />} />
          <Route path={ROUTES.USERS.path} element={<UserManagement />} />
          <Route path={ROUTES.CREATE_USER.path} element={<CreateUser />} />
          <Route path={ROUTES.EDIT_USER.path} element={<EditUser />} />
          <Route path={ROUTES.CREATE_ASSIGNMENT.path} element={<CreateAssignment />} />
          <Route path={ROUTES.EDIT_ASSIGNMENT.path} element={<EditAssignment />} />
          <Route path={ROUTES.TEMPLATE.path} element={<Template />} />
          <Route path={ROUTES.CREATE_ASSETS.path} element={<CreateAssetPage />} />
          <Route path={ROUTES.EDIT_ASSETS.path} element={<EditAssetPage />} />
          <Route path={ROUTES.RETURNING_REQUESTS.path} element={<ReturningRequestManagement />} />
          <Route path={ROUTES.REPORT.path} element={<ReportPage />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME.path} replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
