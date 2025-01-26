import CategoriesComponent from "./Categories.component";
import { CategoriesController } from "./Categories.control";

function Categories() {
  return (
    <CategoriesController>
      <CategoriesComponent />
    </CategoriesController>
  );
}

export default Categories;
