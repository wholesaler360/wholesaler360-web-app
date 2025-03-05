import { createInvoice, fetchAll } from "./invoice-controller.js";
import Router from 'express'

const invoiceRouter = Router()


invoiceRouter.route('/create').post(createInvoice)
invoiceRouter.route('/fetchAll').get(fetchAll)


export { invoiceRouter }