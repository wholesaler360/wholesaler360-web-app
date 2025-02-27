import { fetchAllBatch, changeSellingPrice} from "./batch-controller.js";
import Router from 'express'

const batchRouter = Router()

batchRouter.route('/fetch/:productId').get(fetchAllBatch)
batchRouter.route('/changeSellPrice').post(changeSellingPrice)

export { batchRouter }