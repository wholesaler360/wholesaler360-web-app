import React from "react";
import DashboardComponent from "./Dashboard.component";
import DashboardController from "./Dashboard.control";

function Dashboard() {
  return (
    <DashboardController>
      <DashboardComponent />
    </DashboardController>
  );
}

export default Dashboard;
