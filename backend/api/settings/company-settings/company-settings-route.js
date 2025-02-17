import { Router } from 'express';
import { addCompanyDetails } from './company-settings-controller.js';

const companySettingsRouter = Router();


companySettingsRouter.route('/addCompanyDetails').post(addCompanyDetails);


export { companySettingsRouter }