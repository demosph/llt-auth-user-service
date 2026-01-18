import Joi from "joi";

export const patchMeSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(120),
    avatar_url: Joi.string().uri(),
    plan: Joi.string().valid("Explorer", "Nomad", "Globetrotter"),
  }).min(1),
});

export const patchPrefsSchema = Joi.object({
  body: Joi.object({
    home_city: Joi.string().allow("", null),
    home_lat: Joi.number().precision(6).allow(null),
    home_lng: Joi.number().precision(6).allow(null),
    interests: Joi.array().items(Joi.string()),
    transport_modes: Joi.array().items(
      Joi.string().valid("car", "public", "bike", "walk"),
    ),
    avg_daily_budget: Joi.number().integer().min(0).allow(null),

    theme: Joi.string()
      .valid("light", "dark", "system")
      .default("system")
      .example("system"),

    language: Joi.string()
      .pattern(/^[a-z]{2}(-[A-Z]{2})?$/)
      .default("en")
      .example("en"),

    currency: Joi.string()
      .valid("USD", "EUR", "UAH")
      .default("UAH")
      .example("UAH"),

    notifications_enabled: Joi.boolean().default(true).example(true),

    notification_channels: Joi.array()
      .items(Joi.string().valid("email", "push", "sms"))
      .default(["email"])
      .example(["email"]),
  }).min(1),
});
