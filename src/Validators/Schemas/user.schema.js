import Joi from "joi";
import { GenderEnum, SkillLevelEnum } from "../../Common/enums/user.enum.js";
import generalRules from "../../Utils/generalRules.utils.js";
const Names=['js','Ml','AI','Data']

export const signUpSchema= {
    body: Joi.object({
        firstName: Joi.string().alphanum().required(),
        lastName: Joi.string().min(3).max(30).required(),
        minAge: Joi.number().greater(18).required(),
        maxAge: Joi.number().less(100).required(),
        age: Joi.number().greater(Joi.ref('minAge')).less(Joi.ref('maxAge')).required(),
        gender: Joi.string().valid(...Object.values(GenderEnum)).required(),
        email: generalRules.email,
        password: generalRules.password,
        confirmPassword:Joi.valid(Joi.ref('password')).required(),
        phoneNumber: Joi.string().required(),
        isConfirmed: Joi.boolean().truthy('yes').falsy('no'),
        skills: Joi.array().items(Joi.object({
            name: Joi.string().valid(...Names).required(),
            level: Joi.string().valid(...Object.values(SkillLevelEnum)).required()
        })).length(2).required(),
        userId: generalRules.userId,
    })
}