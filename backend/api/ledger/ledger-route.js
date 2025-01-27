import { createLedger } from "./ledger-controller.js";
import Router from 'express'

const ledgerRouter = Router()

ledgerRouter.route('/create').get(createLedger)

export { ledgerRouter }