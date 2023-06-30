import { Router } from "express";
import AdminController from "./admin.controller";
import { adminProtect } from "./admin.middleware";
import RequestValidator from "../../common/validation";
import { UpdateProduct, UpdateProfile } from "./admin.validation";
import seedAdmin from "../../utils/seed/admin/seedadmin";


const adminRouter = Router();

adminRouter.get("/distributors",adminProtect, AdminController.getAllDistributors);
adminRouter.get("/orders", adminProtect, AdminController.getAllOrders);
adminRouter.get("/products", adminProtect, AdminController.getAllProducts);
adminRouter.post("/signin", AdminController.signIn);
adminRouter.put("/profile/update", adminProtect, RequestValidator.validate(UpdateProfile), AdminController.updateProfile);
adminRouter.put("products/:id", adminProtect, RequestValidator.validate(UpdateProduct), AdminController.updateProduct)


// A route for seeding the Admin Db: might switch to ssh into the server for a better secuirity
adminRouter.post("/seed/adminDatabase", seedAdmin)


export default adminRouter;