import { Router } from "express";
import { AuthController } from "./auth.controller";
import { ResetPassword, SignIn, SignUp } from "./auth.validation";
import RequestValidator from "../../common/validation";
import "express-async-errors";
import { protect } from "../../common/auth";


const authRouter = Router();

authRouter.post("/signup", RequestValidator.validate(SignUp), AuthController.signUp);
authRouter.post("/login", RequestValidator.validate(SignIn), AuthController.SignIn)
authRouter.get("/access-token", AuthController.getAccessToken)
authRouter.post("/logout", AuthController.deleteRefreshToken)
authRouter.post("/reset-password", RequestValidator.validate(ResetPassword), AuthController.resetPassword)
authRouter.post("/forgot-password", AuthController.forgotPassword)
authRouter.post("/verifyemail", AuthController.verifyEmail)
authRouter.get("/verifyemail", protect, AuthController.getVerificationMail)


export default authRouter;