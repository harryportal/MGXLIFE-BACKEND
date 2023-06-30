import { Router } from "express";
import AdminController from "./admin.controller";
import { adminProtect } from "./admin.middleware";
import RequestValidator from "../../common/validation";
import { UpdateProduct, UpdateProfile } from "./admin.validation";


const adminRouter = Router();

adminRouter.get("/distributors",adminProtect, AdminController.getAllDistributors);
adminRouter.get("/orders", adminProtect, AdminController.getAllOrders);
adminRouter.get("/products", adminProtect, AdminController.getAllProducts);
adminRouter.post("/signin", AdminController.signIn);
adminRouter.post("/profile/update", adminProtect, RequestValidator.validate(UpdateProfile), AdminController.updateProfile);
adminRouter.put("products/:id", adminProtect, RequestValidator.validate(UpdateProduct), AdminController.updateProduct)

export default adminRouter;