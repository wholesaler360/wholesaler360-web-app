import { clearAccessToken } from "@/lib/authUtils";
import React from "react";

function Dashboard() {
  return (
    <div>
      <button onClick={clearAccessToken}>LogOut</button>
    </div>
  );
}

export default Dashboard;
