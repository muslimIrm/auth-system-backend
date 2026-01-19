const mongoose = require("mongoose")
const Joi = require("joi")
var uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 100,
            required: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            index: true
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            minlength: 3,
            maxlength: 10,
            match: /^[a-zA-Z0-9_]+$/
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
            match: /^[a-zA-Z0-9_]+$/

        }
    },
    {
        timestamps: true
    }
)

UserSchema.plugin(uniqueValidator)
const Users = mongoose.model("Users", UserSchema)







const validation = (obj, type = "login") => {
    let schema

    if (type === "login") {
        schema = Joi.object({
            email: Joi.string()
                .email({ tlds: { allow: false } })
                .lowercase()
                .trim()
                .required(),

            password: Joi.string()
                .required()
                .min(8)
                .pattern(/^[a-zA-Z0-9_]+$/)


        })

    } else if (type === "signup") {
        console.log(true)
        schema = Joi.object({
            name: Joi.string()
                .min(2)
                .max(100)
                .trim()
                .required(),

            email: Joi.string()
                .email({ tlds: { allow: false } })
                .lowercase()
                .trim()
                .required(),

            username: Joi.string()
                .min(3)
                .max(10)
                .trim()
                .pattern(/^[a-zA-Z0-9_]+$/)
                .required(),

            password: Joi.string()
                .min(8)
                .required()
                .pattern(/^[a-zA-Z0-9_]+$/)

        })

    } else if (type === "update") {

        schema = Joi.object({
            password: Joi.string()
                .min(8)
                .pattern(/^[a-zA-Z0-9_]+$/)
                .required()
        }).min(1)

    } else {
        throw new Error("Invalid validation type")
    }
    return schema.validate(obj, { abortEarly: true })
}



module.exports = {
    Users,
    validation   
}
