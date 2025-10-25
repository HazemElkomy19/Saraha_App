import jwt from "jsonwebtoken";
import {blackListedTokensModel} from "../DB/Models/index.js";
import {User} from "../DB/Models/index.js";
//create authentication middleware
export const authenticationMiddleware = async (req,res,next)=>{
        const {accesstoken} = req.headers;
        if (!accesstoken) {
            return res.status(400).json({message:"please login first"})
        }
   
        const decodedToken = jwt.verify(accesstoken,process.env.JWT_SECRET);
        if (!decodedToken.jti) {
            return res.status(401).json({message:"Unauthorized"})
        }

        const blackListedToken = await blackListedTokensModel.findOne({tokenId:decodedToken.jti});
        if (blackListedToken) {
            return res.status(401).json({message:"token is blacklisted"})
        }

        const user = await User.findById(decodedToken?._id); 
        if (!user) {
            return res.status(401).json({message:"user not found"})
        } 
        req.loggedInUser = {user,token:{tokenId:decodedToken.jti,expirationDate:decodedToken.exp}};
        next();        
    
}
