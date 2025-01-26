import Router from "express";
import { createCustomer, updateCustomer, deleteCustomer, fetchCustomer, fetchAllCustomer } from "./customer-controller.js";

const customerRouter = Router();

customerRouter.route('/create').post(createCustomer);

customerRouter.route('/update').put(updateCustomer);

customerRouter.route('/delete').delete(deleteCustomer);

customerRouter.route('/fetch').get(fetchCustomer);

customerRouter.route('/fetchAll').get(fetchAllCustomer);

export { customerRouter };