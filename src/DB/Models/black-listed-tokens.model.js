
import mongoose from "mongoose";

const blackListedTokens= mongoose.Schema({
    tokenId:{type:String,required:true,unique:true},
    expirationDate:{type:Date,required:true}
})
export const blackListedTokensModel = mongoose.model("BlackListedTokens",blackListedTokens)