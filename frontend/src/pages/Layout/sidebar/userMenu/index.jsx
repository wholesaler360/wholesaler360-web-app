import React from "react";
import UserMenuComponent from "./UserMenu.component";
import { UserMenuController } from "./userMenu.control.jsx";

const UserMenu = ({ user }) => {
  return (
    <>
      <UserMenuController>
        <UserMenuComponent user={user} />
      </UserMenuController>
    </>
  );
}; 

export default UserMenu;
