import React from "react";
import CompanySettingsComponent from "./CompanySettings.component";
import { CompanySettingsController } from "./CompanySettings.control";

function CompanySettings() {
  return (
    <CompanySettingsController>
      <CompanySettingsComponent />
    </CompanySettingsController>
  );
}

export default CompanySettings;
