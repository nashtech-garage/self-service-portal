import React from "react";
import "@css/DropdownMenu.scss";
import DropdownMenuItem from "@components/common/DropDown/DropdownMenuItem";

interface DropMenuItemProps {
  labels: string[];
  menuRef: React.RefObject<HTMLUListElement | null>;
  onLogout?: () => void;
  onChangePassword?: () => void;
}

const DropdownMenu: React.FC<DropMenuItemProps> = ({ labels, menuRef, onLogout, onChangePassword }) => {
  const actionMap: Record<string, (() => void) | undefined> = {
    "Logout": onLogout,
    "Change Password": onChangePassword,
  };
  
  return (
    <ul ref={menuRef} className="navbar__dropdown">
      {labels.map((item) => {
        return (
          <DropdownMenuItem
            key={item}
            label={item}
            isButton={["Logout", "Change Password", "Profile"].includes(item)}
            onAction={actionMap[item]}
          />
        );
      })}
    </ul>
  );
};
export default DropdownMenu;
