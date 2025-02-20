import Router from "express";
import {
  createCustomer,
  updateCustomer,
  updateCustomerAvatar,
  deleteCustomer,
  fetchCustomer,
  fetchAllCustomer,
  fetchCustomerDropdown
} from "./customer-controller.js";
import { upload } from "../../middlewares/multer-middleware.js";
const customerRouter = Router();


customerRouter.route('/create').post(
    upload([{name : "avatar" , maxCount : 1}]),
    createCustomer);


customerRouter.route("/update").put(updateCustomer);

customerRouter.route('/updateImg').put(upload(
    [{name : "avatar" , maxCount : 1}])
    ,updateCustomerAvatar);


customerRouter.route("/delete").delete(deleteCustomer);

customerRouter.route('/fetch').post(fetchCustomer);


customerRouter.route("/fetchAll").get(fetchAllCustomer);
customerRouter.route("/fetchCustomerDropdown").get(fetchCustomerDropdown);
export { customerRouter };
