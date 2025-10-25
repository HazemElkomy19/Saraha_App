import { Router } from "express";

import * as userServices from "../Services/user.service.js";
import { authenticationMiddleware , authorizationMiddleware} from "../../../Middlewares/index.js";  
import { RoleEnum } from "../../../Common/enums/user.enum.js";
import {cloudinaryUpload, localUpload} from "../../../Middlewares/multer.middleware.js";
const userRouter = Router();
const profileImageLimits = {
    fileSize: 5 * 1024 * 1024 // 5 Megabytes
};

userRouter.put("/update", authenticationMiddleware,userServices.updateUserService);
userRouter.delete("/delete", authenticationMiddleware,userServices.deleteUserService);
userRouter.get("/get", authenticationMiddleware,authorizationMiddleware(RoleEnum.ADMIN), userServices.getUsersService);
// --- MODIFIED: Pass limits to localUpload ---
userRouter.post(
    "/upload-profile",
    authenticationMiddleware,
    cloudinaryUpload({
        limits: profileImageLimits  
    }).single("profile"),
    userServices.uploadUserImageService
);
// --- END MODIFIED ---
export {userRouter};