import Joi from "joi";

export const patchMeSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(120),
    avatar_url: Joi.string().uri(),
  }).min(1),
});

export const putPrefsSchema = Joi.object({
  body: Joi.object({
    home_city: Joi.string().allow("", null),
    home_lat: Joi.number().precision(6).allow(null),
    home_lng: Joi.number().precision(6).allow(null),
    interests: Joi.array().items(Joi.string()).default([]),
    transport_modes: Joi.array()
      .items(Joi.string().valid("car", "public", "bike", "walk"))
      .default([]),
    avg_daily_budget: Joi.number().integer().min(0).allow(null),
  }),
});
