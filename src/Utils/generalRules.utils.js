import Joi from "joi";
import { isValidObjectId } from "mongoose";
function objectisValid(value,helper){
    return isValidObjectId(value)?true:helper.message("Invalid Object ID");
}

const generalRules={
     userId: Joi.custom(objectisValid).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
}
export default generalRules
