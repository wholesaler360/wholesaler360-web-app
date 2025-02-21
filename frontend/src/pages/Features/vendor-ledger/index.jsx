import React from "react";
import VendorLedgerComponent from "./VendorLedger.component";
import { VendorLedgerController } from "./VendorLedger.control";

function VendorLedger() {
  return (
    <VendorLedgerController>
      <VendorLedgerComponent />
    </VendorLedgerController>
  );
}

export default VendorLedger;
