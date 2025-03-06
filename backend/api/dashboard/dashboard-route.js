import { getData, getAlertProduct, getBestSellingProducts, getFinancialMetrics } from './dashboard-controller.js'
import Router from 'express'

const dashboardRouter = Router()

dashboardRouter.route('/fetch').get(getData);
dashboardRouter.route('/fetchAlert').get(getAlertProduct);
dashboardRouter.route('/fetchBestSellingProduct').get(getBestSellingProducts);
dashboardRouter.route('/getFinancialMetrics').get(getFinancialMetrics);

export { dashboardRouter }