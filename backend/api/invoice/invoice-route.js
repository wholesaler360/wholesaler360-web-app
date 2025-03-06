import { createInvoice, fetchAll , fetchInvoiceById} from "./invoice-controller.js";
import Router from 'express'

const invoiceRouter = Router()


invoiceRouter.route('/create').post(createInvoice)
invoiceRouter.route('/fetchAll').get(fetchAll)

invoiceRouter.route('/fetch/:invoiceId').get(fetchInvoiceById);

export { invoiceRouter }