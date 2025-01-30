import React from "react";
import {UpdateProductController} from "./UpdateProduct.controller";
import UpdateProductComponent from "./UpdateProduct.component";

function UpdateProduct() {
  return (
      <UpdateProductController>
        <UpdateProductComponent />
      </UpdateProductController>
  );
}

export default UpdateProduct;
