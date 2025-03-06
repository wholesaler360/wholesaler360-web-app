import React from "react";
import AppSettingsComponent from "./AppSettings.component";
import { AppSettingsController } from "./AppSettings.control";

function AppSettings() {
  return (
    <AppSettingsController>
      <AppSettingsComponent />
    </AppSettingsController>
  );
}

export default AppSettings;
