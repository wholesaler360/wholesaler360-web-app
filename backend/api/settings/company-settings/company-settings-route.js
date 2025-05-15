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


companySettingsRouter.route('/companyDetails/update').put(updateCompanyDetails);
companySettingsRouter.route('/companyDetails/fetch').get(fetchCompanyDetails);

companySettingsRouter.route('/bankDetails/update').put(updateCompanyBankDetails);
companySettingsRouter.route('/bankDetails/fetch').get(fetchCompanyBankDetails);

companySettingsRouter.route('/signature/delete').delete(deleteCompanySignature);
companySettingsRouter.route('/signature/fetch').get(fetchCompanySignatures);
companySettingsRouter.route('/signature/create').post(
    upload([{name : 'signature', maxCount : 1}]), 
    addCompanySignature
);

// companySettingsRouter.route('/companyDetails/updateLogo').put(
//     upload([{name : 'logo', maxCount : 1}]), 
//     updateCompanyLogo
// );

// companySettingsRouter.route('/companyDetails/updateFavicon').put(
//     upload([{name : 'favicon', maxCount : 1}]), 
//     updateCompanyFavicon
// );

export { companySettingsRouter };