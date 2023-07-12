import { Router } from "express";
import { protect } from "../../common/auth";
import DistributorController from "./distributor.controller";
import RequestValidator from "../../common/validation";
import { UpdateProfileDto } from "./distributor.dtos";
import container from "../../di/invesify.config";


const distributorController:DistributorController = container.resolve<DistributorController>(DistributorController);
const distributorRouter = Router();


distributorRouter.get("/profile", protect, distributorController.getProfile)
distributorRouter.put("/profile", protect, RequestValidator.validate(UpdateProfileDto), distributorController.updateProfile)
distributorRouter.get("/refferal", protect, distributorController.getReferrals)
distributorRouter.get("/orders", protect, distributorController.getOrders);
distributorRouter.get("/referral-links", protect, distributorController.getReferralLinks)

export default distributorRouter;