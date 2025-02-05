import React from "react";
import AddCustomerControl from "./AddCustomer.control";
import AddCustomerComponent from "./AddCustomer.component";

function AddCustomer() {
  return (
    <AddCustomerControl>
      <AddCustomerComponent />
    </AddCustomerControl>
  );
}

export default AddCustomer;
