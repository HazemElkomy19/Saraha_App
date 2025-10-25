import "dotenv/config";
import express from "express";
import dbConnection from "./DB/db.connection.js";
import * as controller from "./Modules/controller.index.js";
import "./Utils/encryption.utils.js";
import cors from "cors";
import helmet from "helmet";
import {limiter} from "./Middlewares/rate-limitter.middleware.js";
import {getCountryCode} from "./Utils/getCountry.utils.js";
import cron from "node-cron";
import { cleanupExpiredTokens } from "./Utils/cron-tasks.js";


const app = express();
app.use(express.json());
app.use('/uploads',express.static('uploads'));

var whitelist = [process.env.WHITELISTED_ORIGINS]
var corsOptions = {
  origin: function (origin, callback) {
    console.log("The curret origin is ",origin);
    
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}




// app.use(cors(corsOptions));
// app.use(helmet());
// app.use(limiter);
app.use("/api/users", controller.userRouter,controller.authRouter);
app.use("/api/messages",controller.messageRouter)
await dbConnection();


app.use( async(err,req,res,next)=>{
    console.log(err.stack);
    if(req.session && req.session.transaction){
        await req.session.transaction.abortTransaction();
        req.session.transaction.endSession();
        console.log("The trasaction is aborted");
        
    }
    
    res.status(err.cause || 500).json({message:"something broke",err:err.message,stack:err.stack});
})

app.get("/me",async(req,res)=>{
  const countryCode = await getCountryCode(req.headers["x-forwarded-for"])
  res.json(countryCode)
})

cron.schedule('0 0 * * *', () => {
  console.log('CRON: Triggering daily expired token cleanup...');
  cleanupExpiredTokens();
}, {
  scheduled: true,
  timezone: "Africa/Cairo"
});
app.listen(process.env.PORT, async () => {
    
    console.log(`Server is running on port ${process.env.PORT}`);
});





