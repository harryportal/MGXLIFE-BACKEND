import { Router } from "express";
import { protect } from "../../common/auth";
import DistributorController from "./distributor.controller";

const distributorRouter = Router();

distributorRouter.get("/profile", protect, DistributorController.getProfile)

export default distributorRouter;