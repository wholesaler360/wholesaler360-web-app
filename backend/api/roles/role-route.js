import { createRole, updateRole, assignPermission, fetchPermission, deleteRole, fetchAllRole } from "./role-controller.js";
import Router from 'express'

const roleRouter = Router()

roleRouter.route('/createRole').post(createRole)

roleRouter.route('/updateRole').put(updateRole)

roleRouter.route('/assignPermission').put(assignPermission)

roleRouter.route('/fetchRole/:name').get(fetchPermission)

roleRouter.route('/deleteRole').delete(deleteRole)

roleRouter.route('/fetchAllRoles').get(fetchAllRole)

export { roleRouter }