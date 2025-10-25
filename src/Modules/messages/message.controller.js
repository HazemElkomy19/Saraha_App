import { Router } from "express";
import * as messageServices from "./Services/message.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";

const messageRouter = Router();
messageRouter.post("/send/:receiverId",messageServices.sendMessageService)
messageRouter.get("/get",messageServices.getMessagesService)
messageRouter.get("/my-messages", authenticationMiddleware, messageServices.getMyMessagesService);
messageRouter.get("/public", authenticationMiddleware, messageServices.getPublicMessagesService);
messageRouter.put("/public/:messageId", authenticationMiddleware, messageServices.makeMessagePublicService);
export {messageRouter}