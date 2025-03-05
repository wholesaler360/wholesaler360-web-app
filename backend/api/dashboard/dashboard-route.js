import { getData, getAlertProduct, getBestSellingProducts } from './dashboard-controller.js'
import Router from 'express'

const dashboardRouter = Router()

dashboardRouter.route('/fetch').get(getData);
dashboardRouter.route('/fetchAlert').get(getAlertProduct);
dashboardRouter.route('/fetchBestSellingProduct').get(getBestSellingProducts);

export { dashboardRouter }