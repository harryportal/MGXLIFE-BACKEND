import { Router } from "express";
import { protect } from "../../common/auth";
import DistributorController from "./distributor.controller";
import RequestValidator from "../../common/validation";
import { UpdateProfile } from "./distributor.validation";

const distributorRouter = Router();

distributorRouter.get("/profile", protect, DistributorController.getProfile)
distributorRouter.put("/profile", protect, RequestValidator.validate(UpdateProfile), DistributorController.updateProfile)
distributorRouter.get("/refferal", protect, DistributorController.getReferrals)
distributorRouter.get("/orders", protect, DistributorController.getOrders);
distributorRouter.get("/referral-links", protect, DistributorController.getReferralLinks)

export default distributorRouter;