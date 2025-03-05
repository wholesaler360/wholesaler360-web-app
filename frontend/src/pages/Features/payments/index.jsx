import React from "react";
import PaymentsComponent from "./Payments.component";
import PaymentsController from "./Payments.control";

function Payments() {
  return (
    <PaymentsController>
      <PaymentsComponent />
    </PaymentsController>
  );
}

export default Payments;
