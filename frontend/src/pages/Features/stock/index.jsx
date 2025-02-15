import { StockController } from "./Stock.control";
import { StockComponent } from "./Stock.component";

function Stock() {
  return (
    <StockController>
      <StockComponent />
    </StockController>
  );
}

export default Stock;
