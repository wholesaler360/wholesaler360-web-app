import React from "react";
import UpdateVendorController from "./UpdateVendor.control";
import UpdateVendorComponent from "./UpdateVendor.component";

function UpdateVendor() {
  console.log("UpdateVendor index.jsx is rendering");
  return (
    <UpdateVendorController>
      <UpdateVendorComponent />
    </UpdateVendorController>
  );
}

export default UpdateVendor;
