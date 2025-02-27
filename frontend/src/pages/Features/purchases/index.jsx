import React from "react";
import PurchasesComponent from "./Purchases.component";
import PurchasesController from "./Purchases.control";

function Purchases() {
  return (
    <PurchasesController>
      <PurchasesComponent />
    </PurchasesController>
  );
}

export default Purchases;
