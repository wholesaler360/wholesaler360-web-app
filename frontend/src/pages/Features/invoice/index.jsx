import React from "react";
import InvoiceComponent from "./Invoice.component";
import InvoiceController from "./Invoice.control";

function Invoices() {
  return (
    <InvoiceController>
      <InvoiceComponent />
    </InvoiceController>
  );
}

export default Invoices;
