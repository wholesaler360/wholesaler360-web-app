import { getData } from './dashboard-controller.js'
import Router from 'express'

const dashboardRouter = Router()

dashboardRouter.route('/fetch').get(getData);

export { dashboardRouter }