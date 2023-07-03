import { Router } from "express";
import AdminController from "./admin.controller";
import { adminProtect } from "./admin.middleware";
import RequestValidator from "../../common/validation";
import { UpdateProduct, UpdateProfile } from "./admin.validation";
import seedAdmin from "../../utils/seed/admin/seedadmin";
import container from "../../di/invesify.config";

const adminController = container.resolve<AdminController>(AdminController);
const adminRouter = Router();

adminRouter.get("/distributors",adminProtect, adminController.getAllDistributors);
adminRouter.get("/orders", adminProtect, adminController.getAllOrders);
adminRouter.get("/products", adminProtect, adminController.getAllProducts);
adminRouter.post("/signin", adminController.signIn);
adminRouter.put("/profile", adminProtect, RequestValidator.validate(UpdateProfile), adminController.updateProfile);
adminRouter.put("/products/:id", adminProtect, RequestValidator.validate(UpdateProduct), adminController.updateProduct)
adminRouter.get("/profile", adminProtect, adminController.updateProfile)

// A route for seeding the Admin Db: might switch to ssh into the server for a better secuirity
adminRouter.post("/seed/adminDatabase", seedAdmin)


export default adminRouter;