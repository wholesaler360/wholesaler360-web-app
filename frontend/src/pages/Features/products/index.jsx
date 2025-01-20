import { ProductsController } from "./Products.control";
import { ProductsComponent } from "./Products.component";

function Products() {
  return (
    <ProductsController>
      <ProductsComponent />
    </ProductsController>
  );
}

export default Products;