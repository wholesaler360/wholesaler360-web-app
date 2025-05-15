import React from "react";
import CustomerLedgerComponent from "./CustomerLEdger.component";
import { CustomerLedgerController } from "./CustomerLEdger.control";

function CustomerLedger() {
  return (
    <CustomerLedgerController>
      <CustomerLedgerComponent />
    </CustomerLedgerController>
  );
}

export default CustomerLedger;
