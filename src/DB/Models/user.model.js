import mongoose from "mongoose";
import { RoleEnum, GenderEnum,providersEnum } from "../../Common/enums/user.enum.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [3, "First name must be at least 3 characters long"],
        maxlength: 20,
        lowercase: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
    },
    age: {
        type: Number,
        min: [18, "Age must be at least 18"],
        max: [100, "Age must be less than 100"],
        index:{
          name: "idx_age",
        }
    },
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE,
    },
    email: {
        type: String,
        required: true,
        index: {
          unique: true,
            name: "idx_email",
            
        },
       
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    otps:{
      confirmation:String,
      resetPassword:String
    },
    isConfirmed:{
      type:Boolean,
      default: false
    },
    provider:{
      type:String,
      enum:Object.values(providersEnum),
      default:providersEnum.LOCAL
    },
    role:{
      type:String,
      enum:Object.values(RoleEnum),
      default:RoleEnum.USER
    },
    googleSub:{
      type:String,
    },
    profile:{
      secure_url:String,
      public_id:String,
    },
    activeDevices: [
      {
          userAgent: String,
          lastLogin: { type: Date, default: Date.now }
      }
  ]
}, {
    timestamps: true,
    toJSON:{
      virtuals:true
    },
    toObject:{
      virtuals:true
    },
    virtuals:{
      fullName:{
        get(){
          return `${this.firstName} ${this.lastName}`;
        }
      }
    },
    methods:{
      getFullName(){
        return `${this.firstName} ${this.lastName}`;
      },
      getAge(){
        return this.age;
      },
    }
});
userSchema.index({firstName: 1, lastName: 1}, {name: "idx_fullName", unique: true});
userSchema.virtual("Message",{
    ref:"Message",
    localField:"_id",
    foreignField:"receiverId"
})

export const User = mongoose.model("User", userSchema);