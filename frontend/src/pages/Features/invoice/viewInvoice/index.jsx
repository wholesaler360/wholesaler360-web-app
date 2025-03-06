import React from "react";
import ViewInvoiceComponent from "./ViewInvoice.component";
import ViewInvoiceController from "./ViewInvoice.control";

function ViewInvoice() {
  return (
    <ViewInvoiceController>
      <ViewInvoiceComponent />
    </ViewInvoiceController>
  );
}

export default ViewInvoice;
