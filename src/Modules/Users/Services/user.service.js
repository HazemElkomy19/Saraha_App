



import {User,Messege} from "../../../DB/Models/index.js";
import { AsymmetricDecrypt,AsymmetricEncrypt } from "../../../Utils/encryption.utils.js";
import fs from "node:fs";
import { uploadToCloudinary } from "../../../Common/Services/cloudinary.service.js";
import { deleteFromCloudinary } from "../../../Common/Services/cloudinary.service.js";
import mongoose from "mongoose";


export const updateUserService = async (req, res) => {
  try {
    const {_id} = req.loggedInUser;
    const { firstName, lastName, age, gender, email, phoneNumber } = req.body;
    // check if email exists
    const existingUser = await User.findOne({email});
    if (existingUser && existingUser._id.toString() !== _id) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // encrypt the phone number
    const encryptedPhoneNumber = AsymmetricEncrypt(phoneNumber);
    const user = await User.findByIdAndUpdate(_id, { firstName, lastName, age, gender, email, phoneNumber: encryptedPhoneNumber},{new:true});
    if (!user) {  
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const deleteUserService = async (req, res) => {
  const session = await mongoose.startSession();
  req.session = session;
    const {user:{_id}} = req.loggedInUser;
    session.startTransaction();
    const user = await User.findByIdAndDelete(_id,{session});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user.profile){
      await deleteFromCloudinary(user.profile.public_id);
    }

    await Messege.deleteMany({receiverId:_id},{session});

    await session.commitTransaction();  

    session.endSession();
    res.status(200).json({ message: "User deleted successfully", user });
  
   
  
};

export const getUsersService = async (req, res) => {
  try {
    let users = await User.find().populate("Message").select("-password");  
    users = users.map((user) => {
      return {
        ...user,
        phoneNumber: AsymmetricDecrypt(user.phoneNumber)
      }
    });
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const uploadUserImageService = async (req, res) => {
 console.log(req.file);
 const {user:{_id}} = req.loggedInUser;
 const {path} = req.file;
//  const user = await User.findByIdAndUpdate(_id,{profile:path},{new:true});
 const {secure_url,public_id} = await uploadToCloudinary(path,{folder:"Sraha_App/Users/profiles",resource_type:"image"});
 const user = await User.findByIdAndUpdate(_id,{profile:{secure_url,public_id}},{new:true});
 if (!user) {
   return res.status(404).json({ message: "User not found" });
 }
 res.status(200).json({ message: "User image uploaded successfully",user });
};


export const log = async (req,res)=>{
  res.status(200).json({ message: "User logged in successfully" });
}



