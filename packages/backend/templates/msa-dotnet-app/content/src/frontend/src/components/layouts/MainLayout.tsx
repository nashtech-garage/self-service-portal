import ChangePasswordModal from "@components/ChangePasswordModal";
import Navbar from "@components/layouts/Navbar";
import SidebarMenu from "@components/layouts/SidebarMenu";
import "@css/MainLayout.scss";
import type { AppDispatch, RootState } from "@store";
import { getMe } from "@store/auth/authSlice.login";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const isChangedPassword = userProfile?.isChangedPassword;
  const [showModal, setShowModal] = useState(false);

  // Check for password change requirement, but only if logged in
  useEffect(() => {
    // Only run this effect if the user is logged in
    if (userProfile && isChangedPassword === false) {
      setShowModal(true);
    }
  }, [userProfile, isChangedPassword]);

  // Add dependency array to prevent excessive calls
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]); // Only run when component mounts or dispatch changes

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full">
      <Navbar isAuthPage={false} />
      <div className="md:px-8 pt-8 flex flex-row">
        <SidebarMenu />
        <main className="container flex-1">{<Outlet />}</main>
      </div>

      <ChangePasswordModal visible={showModal} onClose={handleModalClose} isChangedPassword={isChangedPassword} />
    </div>
  );
};

export default MainLayout;
