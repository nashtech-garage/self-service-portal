import type { MenuItem } from "@/entities/menuItem";
import type { RootState } from "@store";
import { getSidebarMenuRoutesByUserType } from "@utils/getRouteInfo";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarMenu = () => {
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const navigate = useNavigate();

  const currentPath = location.pathname;

  // Use useEffect to update menu items only after userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      if (userProfile) {
        const items = getSidebarMenuRoutesByUserType(userProfile.userType);
        setMenuItems(items);
      }
    }
  }, [userProfile]);

  const isPathActive = (menuPath: string, currentPath: string): boolean =>
    currentPath === menuPath || currentPath.startsWith(`${menuPath}/`);

  return (
    <aside className="menubar">
      <div className="flex flex-column">
        <img src="/images/Logo_lk.png" alt="Logo" />
        <span className="text-xl font-bold text-left">Online Asset Management</span>
      </div>

      <ul className="list-none p-0 m-0 flex flex-column gap-1">
        {menuItems.map((item, idx) => {
          const isActive = isPathActive(item.path, currentPath);

          return (
            <li
              key={idx}
              className={`cursor-pointer p-3 text-black text-xl font-bold ${isActive ? "active-menu" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SidebarMenu;
