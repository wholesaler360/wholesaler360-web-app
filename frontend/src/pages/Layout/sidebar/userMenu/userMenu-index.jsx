import React from "react";
import { UserMenu } from "./UserMenu";
import { UserMenuController } from "./userMenu.control.jsx";

const UserMenuComponent = ({ user }) => {
  return (
    <>
      <UserMenuController>
        <UserMenu user={user} />
      </UserMenuController>
    </>
  );
};

export default UserMenuComponent;
