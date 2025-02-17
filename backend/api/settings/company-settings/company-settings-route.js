import { Router } from 'express';
import { addCompanyDetails, fetchCompanyDetails, updateCompanyLogo, updateCompanyFavicon } from './company-settings-controller.js';
import { upload } from "../../../middlewares/multer-middleware.js";

const companySettingsRouter = Router();


companySettingsRouter.route('/addCompanyDetails').post(addCompanyDetails);
companySettingsRouter.route('/fetchCompanyDetails').get(fetchCompanyDetails);

companySettingsRouter.route('/updateCompanyLogo').post(
    upload([{name : 'logo', maxCount : 1}]), 
    updateCompanyLogo
)
companySettingsRouter.route('/updateCompanyFavicon').post(
    upload([{name : 'favicon', maxCount : 1}]), 
    updateCompanyFavicon
)

export { companySettingsRouter }