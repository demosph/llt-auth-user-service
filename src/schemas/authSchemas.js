import Joi from "joi";
import { emailRegexp } from "../constants/auth.js";

const exampleEmail = "example@gmail.com";

export const registerSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .pattern(emailRegexp)
      .min(4)
      .max(255)
      .required()
      .example(exampleEmail),
    password: Joi.string().min(6).max(255).required(),
    name: Joi.string().min(2).max(30).required(),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .pattern(emailRegexp)
      .min(4)
      .max(255)
      .required()
      .example(exampleEmail),
    password: Joi.string().max(255).required(),
  }),
});

export const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});

export const oauthGoogleIdTokenSchema = Joi.object({
  body: Joi.object({
    id_token: Joi.string().required(),
  }),
});
