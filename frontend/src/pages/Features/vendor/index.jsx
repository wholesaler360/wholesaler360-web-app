import React from "react";
import VendorComponent from "./Vendor.component";
import VendorController from "./Vendor.control";

function Vendors() {
  return (
    <VendorController>
      <VendorComponent />
    </VendorController>
  );
}

export default Vendors;
