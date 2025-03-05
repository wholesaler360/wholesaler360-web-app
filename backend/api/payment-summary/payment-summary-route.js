import { getAllPayments } from '../payment-summary/payment-summary-controller.js'
import Router from 'express'

const paymentRouter = Router()

paymentRouter.route('/fetch').get(getAllPayments);

export { paymentRouter }