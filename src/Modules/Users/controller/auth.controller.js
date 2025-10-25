import { Router } from "express";

import * as authService from "../Services/auth.service.js";
import { authenticationMiddleware , validationMiddleware } from "../../../Middlewares/index.js";
// import { signUpSchema } from "../../../Validators/Schemas/user.schema.js";
const authRouter = Router();
authRouter.post("/signup",authService.signUpService);
authRouter.post("/signin", authService.signInService);

// --- NEW ROUTE ---
authRouter.post("/resend-confirm", authService.resendConfirmationEmailService);
// --- END NEW ROUTE ---

authRouter.put("/confirm",authService.confirmEmailService)
authRouter.post("/logout",authenticationMiddleware,authService.logOutService)
authRouter.post("/refresh-token",authService.refreshTokenService)
authRouter.post("/forget-password",authService.forgetPasswordService)
authRouter.post("/reset-password",authService.resetPasswordService)
authRouter.post("/delete-expired-tokens",authService.deleteExpiredTokensService)
authRouter.post("/auth-gmail",authService.signUpGmailService)

export  {authRouter};