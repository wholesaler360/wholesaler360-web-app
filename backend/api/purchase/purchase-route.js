import { createPurchase } from "./purchase-controller.js";
import Router from 'express'

const purchaseRouter = Router()

purchaseRouter.route('/create').post(createPurchase)


export { purchaseRouter }