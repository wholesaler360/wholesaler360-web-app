import { createRole,assignPermission,fetchPermission,deleteRole,fetchAllRole } from "./role-controller.js";
import Router from 'express'

const roleRouter = Router()

roleRouter.route('/createRole').post(createRole)

roleRouter.route('/assignPermission').put(assignPermission)

roleRouter.route('/fetchRole').get(fetchPermission)

roleRouter.route('/deleteRole').delete(deleteRole)

roleRouter.route('/fetchAllRoles').get(fetchAllRole)
export { roleRouter }