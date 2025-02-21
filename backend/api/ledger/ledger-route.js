import { createLedger, showLedger } from "./ledger-controller.js";
import Router from 'express'

const ledgerRouter = Router()

ledgerRouter.route('/create').post(createLedger);
ledgerRouter.route('/show').post(showLedger);

export { ledgerRouter }