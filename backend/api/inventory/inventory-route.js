import { addPurchaseStock} from "./inventory-controller.js";
import Router from 'express'

const inventoryRouter = Router()

inventoryRouter.route('/addStock').post(addPurchaseStock);
// inventoryRouter.route('/fetch').get(showLedger);

export { inventoryRouter }