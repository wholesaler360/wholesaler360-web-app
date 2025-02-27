import { createPurchase, fetch, fetchAll } from "./purchase-controller.js";
import Router from 'express'

const purchaseRouter = Router()

purchaseRouter.route('/create').post(createPurchase)
purchaseRouter.route('/fetch/:purchaseId').get(fetch)

purchaseRouter.route('/fetchAll').get(fetchAll)

export { purchaseRouter }