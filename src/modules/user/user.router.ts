import { Router } from "express";
import { protect } from "../../common/auth";
import { Profile } from "./user.validation";
import UserController from "./user.controller";
import RequestValidator from "../../common/validation";
import { multerUpload } from "../../utils/fileStorage/multer";
import "express-async-errors";

const userRouter = Router();

userRouter.post("/subscribe", protect(), UserController.subscribeforUpdates)
userRouter.get("/profile", protect(), UserController.getProfile)
userRouter.put("/profile", protect(), RequestValidator.validate(Profile), UserController.updateProfile)
userRouter.get("/dashboard", protect(), UserController.profilewithListingCount)
userRouter.post("/kyc", protect(),  multerUpload.any(), UserController.addKYC)

export default userRouter;