import { Router } from "express";
import AdminController from "./admin.controller";


const adminRouter = Router();

adminRouter.get("/distributors", AdminController.getAllDistributors);
adminRouter.get("/orders", AdminController.getAllOrders)
adminRouter.get("/products", AdminController.getAllProducts)
adminRouter.post("/profile/update", AdminController.up)


export default adminRouter;