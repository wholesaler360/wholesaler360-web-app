import { Router } from 'express';
import { 
    updateCompanyDetails, 
    fetchCompanyDetails, 
    updateCompanyLogo, 
    updateCompanyFavicon, 
    updateCompanyBankDetails,
    fetchCompanyBankDetails, 
    addCompanySignature, 
    deleteCompanySignature, 
    fetchCompanySignatures 
} from './company-settings-controller.js';
import { upload } from "../../../middlewares/multer-middleware.js";

const companySettingsRouter = Router();


companySettingsRouter.route('/updateCompanyDetails').put(updateCompanyDetails);
companySettingsRouter.route('/fetchCompanyDetails').get(fetchCompanyDetails);
companySettingsRouter.route('/updateCompanyBankDetails').put(updateCompanyBankDetails);
companySettingsRouter.route('/fetchCompanyBankDetails').get(fetchCompanyBankDetails);

companySettingsRouter.route('/deleteCompanySignature').delete(deleteCompanySignature);
companySettingsRouter.route('/fetchCompanySignatures').get(fetchCompanySignatures);
companySettingsRouter.route('/addCompanySignature').post(
    upload([{name : 'signature', maxCount : 1}]), 
    addCompanySignature
);

companySettingsRouter.route('/updateCompanyLogo').put(
    upload([{name : 'logo', maxCount : 1}]), 
    updateCompanyLogo
);

companySettingsRouter.route('/updateCompanyFavicon').put(
    upload([{name : 'favicon', maxCount : 1}]), 
    updateCompanyFavicon
);

export { companySettingsRouter };