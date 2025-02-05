import React from "react";
import CustomerController from "./Customers.control";
import CustomersComponent from "./Customers.component";

function Customers() {
  return (
    <CustomerController>
      <CustomersComponent />
    </CustomerController>
  );
}

export default Customers;
