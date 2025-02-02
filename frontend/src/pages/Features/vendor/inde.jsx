import React from "react";
import VendorComponent from "./Vendor.component";
import VendorController from "./Vendor.control";

function vendor() {
  return <VendorController>
    <VendorComponent />
  </VendorController>;
}

export default vendor;
