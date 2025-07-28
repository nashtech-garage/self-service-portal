import Navbar from "@components/layouts/Navbar";
import "@css/MainLayout.scss";
import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => (
  <div>
    <div className="main-layout">
      <Navbar isAuthPage={true} />
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
