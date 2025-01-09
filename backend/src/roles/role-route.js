import { createRole,assignPermission,fetchPermission,deleteRole } from "./role-controller.js";
import Router from 'express'

const roleRouter = Router()

roleRouter.route('/createRole').post(createRole)

roleRouter.route('/assignPermission').post(assignPermission)

roleRouter.route('/fetchRole').get(fetchPermission)

roleRouter.route('/deleteRole').delete(deleteRole)

export { roleRouter }