import { createInvoice } from "./invoice-controller.js";
import Router from 'express'

const invoiceRouter = Router()


invoiceRouter.route('/create').post(createInvoice)


export { invoiceRouter }