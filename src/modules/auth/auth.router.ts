import { Router } from "express";
import { AuthController } from "./auth.controller";
import { ResetPassword, SignIn, SignUp } from "./auth.validation";
import RequestValidator from "../../common/validation";
import "express-async-errors";
import { protect } from "../../common/auth";
import container from "../../di/invesify.config";


const authRouter = Router();
const authController = container.resolve<AuthController>(AuthController);

authRouter.post("/signup", RequestValidator.validate(SignUp), authController.signUp);
authRouter.post("/login", RequestValidator.validate(SignIn), authController.SignIn)
authRouter.get("/access-token", authController.getAccessToken)
authRouter.post("/logout", authController.deleteRefreshToken)
authRouter.post("/reset-password", RequestValidator.validate(ResetPassword), authController.resetPassword)
authRouter.post("/forgot-password", authController.forgotPassword)
authRouter.post("/verifyemail", authController.verifyEmail)
authRouter.get("/verifyemail", protect, authController.getVerificationMail)


export default authRouter;