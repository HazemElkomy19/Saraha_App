import mongoose from "mongoose";

const messegeSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    
    isPublic: {
        type: Boolean,
        default: false
    }
    
},{timestamps:true})
export const Messege = mongoose.model("Message",messegeSchema)