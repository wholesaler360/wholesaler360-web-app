import { fetchAllBatch} from "./batch-controller.js";
import Router from 'express'

const batchRouter = Router()

batchRouter.route('/fetch').post(fetchAllBatch)

export { batchRouter }