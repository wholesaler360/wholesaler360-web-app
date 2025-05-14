import { fetchInventory } from "./inventory-controller.js";
import Router from 'express'

const inventoryRouter = Router()

inventoryRouter.route('/fetch').get(fetchInventory);
// inventoryRouter.route('/fetch').get(showLedger);


export { inventoryRouter  }