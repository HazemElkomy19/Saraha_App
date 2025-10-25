


import { compareSync, hashSync } from "bcrypt";
import {User , blackListedTokensModel} from "../../../DB/Models/index.js";
import { AsymmetricDecrypt, AsymmetricEncrypt } from "../../../Utils/encryption.utils.js";
import { emitter, sendEmail } from "../../../Utils/send-email.utils.js";
import { customAlphabet, nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
const uniqueString = customAlphabet("dewndieff2fr",5)

import { OAuth2Client  } from "google-auth-library";
import { RoleEnum } from "../../../Common/enums/user.enum.js";
import { providersEnum } from "../../../Common/enums/user.enum.js";



export const signUpService = async (req, res) => {
  try {
    const { firstName, lastName, age, gender, email, password, phoneNumber, role } = req.body;
    const isUserExist = await User.findOne({ 
      email,provider:providersEnum.LOCAL
     });
    if (isUserExist) {
      return res.status(409).json({ message: "User already exists" });
    }
    const encryptedPhoneNumber = AsymmetricEncrypt(phoneNumber);
    const hashedPassword= hashSync(password, +process.env.SALT_ROUNDS)

    const otp = uniqueString()
    const user = await User.create({ 
        firstName, 
        lastName, 
        age, 
        gender, 
        email, 
        password: hashedPassword, 
        phoneNumber: encryptedPhoneNumber,
        role, 
        provider: providersEnum.LOCAL,
        otps: {confirmation: hashSync(otp, +process.env.SALT_ROUNDS)}
      });
    
    // await sendEmail({
    //   to:email,
    //   subject:"Confitmation Email",
    //   content:
    //   `Your confirmation OTP is ${otp}
    //   `
    // })
    emitter.emit('sendEmail',{
      to:email,
      subject:"Confitmation Email",
      content:
      `Your confirmation OTP is ${otp}
      `
    })
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const confirmEmailService = async (req,res,next)=>{
const {email , otp} = req.body
const user = await User.findOne({email,isConfirmed:false});
if (!user){
  return next(new Error("User not found or already confirmed"),{cause:400})
}
const isOtpMatched = compareSync(otp,user.otps?.confirmation)
if (!isOtpMatched){
  return next(new Error("Invalid OTP"),{cause:400})
}
user.isConfirmed=true;
user.otps.confirmation=undefined;
await user.save()
return res.status(200).json({message:"Confirmed"})
}

export const signInService = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email,provider:providersEnum.LOCAL });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPasswordMatched = compareSync(password,user.password);
      if(!isPasswordMatched){
        return res.status(404).json({ message: "Invalid email or password" });
      }
  
      
      const userAgent = req.headers['user-agent'] || 'unknown';
  
      const deviceExists = user.activeDevices.find(
          d => d.userAgent === userAgent 
      );
  
      if (deviceExists) {
          deviceExists.lastLogin = Date.now();
      } else {
          
          if (user.activeDevices.length >= 2) {
              return res.status(403).json({ message: "Login limit of 2 devices reached. Please log out from another device." });
          }
         
          user.activeDevices.push({ userAgent, lastLogin: Date.now() });
      }
      await user.save();
    
  
      const token = jwt.sign({_id:user._id, email:user.email},process.env.JWT_SECRET,{
        expiresIn:"1d",
        jwtid:uuidv4(),
      })
      const refreshToken = jwt.sign({_id:user._id, email:user.email},process.env.JWT_SECRET_REFRESH,{
        expiresIn:"7d",
        jwtid:uuidv4(),
      })
  
      return res.status(200).json({ message: "User signed in successfully", token,refreshToken });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

  

// --- MODIFIED SERVICE: logOutService ---
export const logOutService = async (req,res)=>{
    try {
      // Note: We get the full user object from the auth middleware
      const{ token, user } = req.loggedInUser;
      const expirationDate = new Date(token.expirationDate*1000);
      
      // 1. Blacklist the token
      await blackListedTokensModel.create(
        {   tokenId:token.tokenId,
            expirationDate,
            userId:user._id
        }
      );
  
      // --- NEW LOGIC: Remove device from active list ---
      const userAgent = req.headers['user-agent'] || 'unknown';
  
      user.activeDevices = user.activeDevices.filter(
          d => !(d.userAgent === userAgent)
      );
      await user.save();
      // --- END NEW LOGIC ---
  
      res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
      res.status(500).json({message:"Internal server error", error: error.message});
    }
  }

export const refreshTokenService = async (req,res)=>{
 
    const {refreshtoken} = req.headers;
    const decodedToken = jwt.verify(refreshtoken,process.env.JWT_SECRET_REFRESH);
    
    const token = jwt.sign({_id:decodedToken._id, email:decodedToken.email},process.env.JWT_SECRET_REFRESH,{
      expiresIn:"1d",
      jwtid:uuidv4(),
      
    })
    res.status(200).json({message:"User token refreshed succesfully",token});
  
}

export const deleteExpiredTokensService = async (req,res)=>{
  try {
    const expiredTokens = await blackListedTokensModel.find({expirationDate:{$lt:Date.now()}});
    await blackListedTokensModel.deleteMany({expirationDate:{$lt:Date.now()}});
    res.status(200).json({message:"Expired tokens deleted successfully",expiredTokens});
  } catch (error) {
    res.status(500).json({message:"Internal server error", error: error.message});
  }
}


export const forgetPasswordService = async (req,res)=>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({message:"User not found"});
    }
    const otp = uniqueString()
    user.otps.resetPassword = hashSync(otp,+process.env.SALT_ROUNDS)
    await user.save()
    await sendEmail({
      to:email,
      subject:"Forget Password",
      content:
      `Your forget password OTP is ${otp}
      `
    })
    emitter.emit('sendEmail',{to:email,subject:"Forget Password",content:`Your forget password OTP is ${otp}`})
    res.status(200).json({message:"Forget password email sent successfully"})
  } catch (error) {
    res.status(500).json({message:"Internal server error", error: error.message});
  }
}

export const resetPasswordService = async (req,res)=>{
  try {
    const {email,otp,password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({message:"User not found"});
    }
    const isOtpMatched = compareSync(otp,user.otps?.resetPassword)
    if (!isOtpMatched) {
      return res.status(400).json({message:"Invalid OTP"});
    }
    user.password = hashSync(password,+process.env.SALT_ROUNDS)
    user.otps.resetPassword = undefined
    await user.save()
    res.status(200).json({message:"Password reset successfully"})
  } catch (error) {
    res.status(500).json({message:"Internal server error", error: error.message});
  }
}

export const signUpGmailService = async (req,res)=>{
    const {idToken} = req.body;
    const client = new OAuth2Client()
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });
    const {email,given_name,family_name,email_verified,sub} = ticket.getPayload();
    if (!email_verified) {
      return res.status(400).json({message:"Invalid email"})
    }
    const isUserExist = await User.findOne({googleSub:sub , provider:providersEnum.GOOGLE});
    let newUser;
    if (!isUserExist) {
       newUser = await User.create(
        {email
          ,firstName:given_name
          ,lastName:family_name || ""
          ,role:RoleEnum.USER,
          isConfirmed:true,
          provider:providersEnum.GOOGLE,
          password:hashSync(uniqueString(),+process.env.SALT_ROUNDS),
        googleSub:sub}
      
      )
    }
    else{
      newUser = isUserExist;
      isUserExist.firstName = given_name;
      isUserExist.lastName = family_name || "";
      
      await isUserExist.save()
    }
  
    
    const userAgent = req.headers['user-agent'] || 'unknown';
  
    const deviceExists = newUser.activeDevices.find(
        d => d.userAgent === userAgent 
    );
  
    if (deviceExists) {
        deviceExists.lastLogin = Date.now();
    } else {
        if (newUser.activeDevices.length >= 2) {
            return res.status(403).json({ message: "Login limit of 2 devices reached. Please log out from another device." });
        }
        newUser.activeDevices.push({ userAgent, lastLogin: Date.now() });
    }
    await newUser.save();
  
    
    const token = jwt.sign({_id:newUser._id, email:newUser.email},process.env.JWT_SECRET,{
      expiresIn:"1d",
      jwtid:uuidv4(),
      
    })
    const refreshToken = jwt.sign({_id:newUser._id, email:newUser.email},process.env.JWT_SECRET_REFRESH,{
      expiresIn:"7d",
      jwtid:uuidv4(),
      
    })
  
    res.status(200).json({message:"User signed up successfully",tokens:{token,refreshToken}})
  }




  export const resendConfirmationEmailService = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({
            email,
            isConfirmed: false,
            provider: providersEnum.LOCAL
        });

        if (!user) {
            return res.status(404).json({ message: "User not found or is already confirmed." });
        }

      
        const otp = uniqueString();
        user.otps.confirmation = hashSync(otp, +process.env.SALT_ROUNDS);
        await user.save();

       
        emitter.emit('sendEmail', {
            to: email,
            subject: "Resent: Confirmation Email",
            content: `Your new confirmation OTP is ${otp}`
        });

        res.status(200).json({ message: "Confirmation email resent successfully." });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 