import { Router } from 'express';
import { fetchAppEmailSettings, updateAppEmailSettings } from './app-settings-controller.js';

const appSettingsRouter = Router();


appSettingsRouter.get('/emailSettings/fetch', fetchAppEmailSettings);
appSettingsRouter.put('/emailSettings/update', updateAppEmailSettings);

export { appSettingsRouter };