import { Router } from 'express';
import { 
    fetchAppEmailSettings, 
    updateAppEmailSettings, 
    fetchDefaultInvoiceTemplate, 
    updateDefaultInvoiceTemplate 
} from './app-settings-controller.js';

const appSettingsRouter = Router();


appSettingsRouter.get('/emailSettings/fetch', fetchAppEmailSettings);
appSettingsRouter.put('/emailSettings/update', updateAppEmailSettings);

appSettingsRouter.get('/invoiceTemplate/fetchDefault', fetchDefaultInvoiceTemplate);
appSettingsRouter.put('/invoiceTemplate/updateDefault', updateDefaultInvoiceTemplate);

export { appSettingsRouter };