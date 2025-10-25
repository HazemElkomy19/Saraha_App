


import {ipKeyGenerator, rateLimit} from "express-rate-limit";
import {getCountryCode} from "../Utils/getCountry.utils.js";
import MongoStore from "rate-limit-mongo";

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: async (req)=>{
        const {country_code} = await getCountryCode(req.headers["x-forwarded-for"]);
        if(country_code === "IN"){
            return 20;
        }
        if(country_code === "EG"){
            return 30;
        }
        return 5;
    },
    requestPropertyName:"rateLimit",
    statusCode:429,
    legacyHeaders:false,
    handler:(req,res,next)=>{
        res.status(429).json({message:"Too many requests from this IP, please try again after 15 minutes"})
    },
    keyGenerator:(req)=>{
       const ip = ipKeyGenerator(req.headers["x-forwarded-for"])
       console.log("The ip is ", `${ip}_${req.path}`);
       return `${ip}_${req.path}`
    },
    store: new MongoStore({
        uri:process.env.DATABASE_URL,
        collectionName:"rateLimit",
        expireTimeMs:15*60*1000,
        
    })
})