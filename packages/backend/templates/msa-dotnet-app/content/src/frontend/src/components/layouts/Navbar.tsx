import { getRouteInfo } from "@/utils/getRouteInfo";
import ChangePasswordModal from "@components/ChangePasswordModal";
import { DEFAULT_LOGO_LK } from "@constants/app";
import { authService } from "@services/authService";
import { LocalStorageService } from "@services/storage/BaseStorageService";
import type { RootState } from "@store";
import { Menubar } from "primereact/menubar";
import type { MenuItem } from "primereact/menuitem";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ConfirmationDialog from "@/components/common/ConfirmationDialog/ConfirmationDialog";

interface NavbarProps {
  isAuthPage?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthPage = false }) => {
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const location = useLocation();
  const { breadcrumbs } = getRouteInfo(location.pathname);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    LocalStorageService.clear();
    navigate("/login");
  };

  const defaultItem: MenuItem = useMemo(
    () => ({
      items: [
        {
          label: "Change Password",
          command: () => {
            setShowChangePassword(true);
          },
        },
        {
          label: "Logout",
          command: async () => {
            setShowLogoutDialog(true);
          },
        },
      ],
    }),
    [navigate]
  );

  const [menuItem, setMenuItem] = useState<MenuItem>(defaultItem);

  useEffect(() => {
    if (userProfile) {
      const updateMenuItem = {
        label: userProfile.username,
        ...defaultItem,
      };
      setMenuItem(updateMenuItem);
    }
  }, [userProfile, defaultItem]);

  return (
    <header className="navbar px-4 md:px-8 flex justify-content-between align-items-center fixed w-full fixed top-0 left-0 font-bold text-base">
      <div className="w-full flex flex-row justify-content-between align-items-center py-2">
        <div className="flex flex-row align-items-center gap-2">
          {isAuthPage && <img src={DEFAULT_LOGO_LK} alt="Logo" className="logo" />}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex flex-row align-items-center mt-1 text-title">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span className="text-white px-2"> &gt; </span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-white">{crumb.title}</span>
                  ) : (
                    <NavLink to={crumb.path} className="text-white no-underline">
                      {crumb.title}
                    </NavLink>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {!isAuthPage ? <Menubar className="bg-none p-0 m-0" model={[menuItem]} /> : null}

        <ChangePasswordModal
          visible={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          isChangedPassword={true}
        />

        <ConfirmationDialog
          visible={showLogoutDialog}
          onHide={() => setShowLogoutDialog(false)}
          onConfirm={handleLogout}
          title="Are you sure?"
          message="Do you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
        />
      </div>
    </header>
  );
};

export default Navbar;
