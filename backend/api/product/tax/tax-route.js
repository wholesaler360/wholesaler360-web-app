import { Router } from "express";
import { createTax , updateTaxPercent ,deleteTax , getTax, getAllTax } from "./tax-controller.js";

const taxRouter = Router();

taxRouter.route('/createTax').post(createTax);

taxRouter.route('/updateTaxPercent').put(updateTaxPercent);

taxRouter.route('/deleteTax').delete(deleteTax);

taxRouter.route('/getTax').post(getTax);

taxRouter.route('/getAllTax').get(getAllTax);

export { taxRouter };