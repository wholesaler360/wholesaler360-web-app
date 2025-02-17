import { changePassword, editProfile, fetchDetails, changeAvatar } from "./account-settings-controller.js";
import Router from 'express';
import { upload } from "../../../middlewares/multer-middleware.js";
const accountSettingsRouter = Router();

accountSettingsRouter.route('/changePassword').put(changePassword);
accountSettingsRouter.route('/update').put(editProfile);
accountSettingsRouter.route('/fetch').get(fetchDetails);
accountSettingsRouter.route('/changeAvatar').put(
    upload([{name : 'avatar', maxCount : 1}])
    ,changeAvatar);
export { accountSettingsRouter }