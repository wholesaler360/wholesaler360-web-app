import { createCustomerLedger, showCustomerLedger } from "./customer-ledger-controller.js";
import Router from 'express'

const customerLedgerRouter = Router()

customerLedgerRouter.route('/create').post(createCustomerLedger);
customerLedgerRouter.route('/show/:customerId').get(showCustomerLedger);

export { customerLedgerRouter }