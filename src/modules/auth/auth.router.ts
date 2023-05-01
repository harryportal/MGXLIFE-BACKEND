import { Router } from "express";
import { AuthController } from "./auth.controller";
import { protect } from "../../common/auth";
import { SignIn, SignUp, Profile, RefreshToken } from "./auth.validation";
import RequestValidator from "../../common/validation";
import "express-async-errors";


const authRouter = Router();

authRouter.post("/signup", RequestValidator.validate(SignUp), AuthController.signUp);
authRouter.post("/profile", protect(false), RequestValidator.validate(Profile),AuthController.addProfile)
authRouter.post("/login", RequestValidator.validate(SignIn), AuthController.SignIn)
authRouter.post("/access-token", RequestValidator.validate(RefreshToken), AuthController.getAccessToken)
authRouter.post("/logout", RequestValidator.validate(RefreshToken), AuthController.deleteRefreshToken)
authRouter.post("/reset-password", AuthController.addorResetPassword)
authRouter.post("/forgot-password", AuthController.forgotPassword)


export default authRouter;