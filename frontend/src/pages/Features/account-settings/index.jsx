import React from "react";
import AccountSettingsComponent from "./AccountSettings.component";
import { AccountSettingsController } from "./AccountSettings.control";

function AccountSettings() {
  return (
    <AccountSettingsController>
      <AccountSettingsComponent />
    </AccountSettingsController>
  );
}

export default AccountSettings;
