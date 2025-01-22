import React from "react";
import { AddProductController } from "./AddProduct.control";
import AddProductComponent from "./AddProduct.component";

function AddProduct() {
  return (
    <AddProductController>
      <AddProductComponent />
    </AddProductController>
  );
}

export default AddProduct;
